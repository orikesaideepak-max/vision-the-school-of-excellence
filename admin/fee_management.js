// ======================================================
// SUPABASE
// ======================================================

import { createClient }
from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const supabase = createClient(

"https://gocoupvzzsgouwdkdmzu.supabase.co",

"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw"

);



// ======================================================
// VARIABLES
// ======================================================

let students=[];

let fees=[];

let payments=[];

let filteredStudents=[];





// ======================================================
// LOAD DATA
// ======================================================

async function loadFeeData(){


let {data:studentData,error:studentError}=

await supabase

.from("profiles")

.select(
"id,full_name,mobile,class_name"
)

.eq("role","student");



if(studentError){

console.log(studentError);

return;

}




let {data:feeData,error:feeError}=

await supabase

.from("fees")

.select("*");



if(feeError){

console.log(feeError);

}




let {data:paymentData,error:paymentError}=

await supabase

.from("fee_payments")

.select("*")
.order("payment_date",
{
ascending:false
});



if(paymentError){

console.log(paymentError);

}



students = studentData || [];

fees = feeData || [];

payments = paymentData || [];



filteredStudents=[...students];



renderTable();

updateDashboard();


}



window.loadFeeData=loadFeeData;







// ======================================================
// GET FEE
// ======================================================

function getFee(studentId){


return fees.find(

f=>f.student_id===studentId

)

||

{

total_fee:0,

paid_fee:0,

due_fee:0

};


}







// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard(){



let totalStudents = students.length;



let totalFee = fees.reduce(

(sum,f)=>

sum + Number(f.total_fee || 0),

0

);



let totalPaid = fees.reduce(

(sum,f)=>

sum + Number(f.paid_fee || 0),

0

);



let totalDue = fees.reduce(

(sum,f)=>

sum + Number(f.due_fee || 0),

0

);


document.getElementById("totalStudents").innerText =
totalStudents;



document.getElementById("totalFee").innerText =
"₹"+totalFee;



document.getElementById("totalCollection").innerText =
"₹"+totalPaid;



document.getElementById("totalPending").innerText =
"₹"+totalDue;



}

// OPEN PENDING FEES PAGE
function openPendingFees() {
    window.location.href = "pending_fees.html";
}

window.openPendingFees = openPendingFees;

function openCollectionFees() {
    window.location.href = "collection_fees.html";
}

window.openCollectionFees = openCollectionFees;




// ======================================================
// SEARCH
// ======================================================


function applySearch(){



let name =

document
.getElementById("searchName")
.value
.toLowerCase();



let cls =

document
.getElementById("searchClass")
.value
.toLowerCase();



filteredStudents = students.filter(s=>{


let nameMatch =

s.full_name
.toLowerCase()
.includes(name)

||

s.mobile?.includes(name);



let classMatch =

!cls ||

s.class_name
?.toLowerCase()
.includes(cls);



return nameMatch && classMatch;



});



renderTable();



}


window.applySearch=applySearch;

// ======================================================
// RENDER TABLE
// ======================================================


function renderTable(){


let table = document.getElementById(
"feeTable"
);


if(!table) return;


table.innerHTML="";



filteredStudents.forEach(student=>{


let fee=getFee(student.id);



table.innerHTML += `


<tr>


<td>
${student.full_name || "-"}
</td>



<td>
${student.mobile || "-"}
</td>



<td>
${student.class_name || "-"}
</td>



<td>
₹${fee.total_fee}
</td>



<td>
₹${fee.paid_fee}
</td>



<td>
₹${fee.due_fee}
</td>




<td>

<input

type="number"

id="total_${student.id}"

value="${fee.total_fee}"

>


<button

onclick="updateTotal('${student.id}')"

>

Save

</button>


</td>




<td>


<button

onclick="openPayment('${student.id}',
'${student.full_name}')"

>

Pay

</button>


</td>




<td>


<button

onclick="sendWhatsApp('${student.id}')"

>

📱 WhatsApp

</button>


<button

onclick="sendSMS('${student.id}')"

>

✉ SMS

</button>


</td>




<td>


<button

onclick="showHistory('${student.id}')"

>

History

</button>


</td>



</tr>



`;


});


}








// ======================================================
// UPDATE TOTAL FEE
// ======================================================


window.updateTotal = async function(id){



let total = Number(

document
.getElementById(
"total_"+id
)
.value

);



let old=getFee(id);



let due=Math.max(

0,

total-old.paid_fee

);




const {error}=

await supabase

.from("fees")

.upsert({

student_id:id,

total_fee:total,

paid_fee:old.paid_fee,

due_fee:due

},

{

onConflict:"student_id"

});





if(error){

alert(error.message);

return;

}



alert("Fee Updated");


loadFeeData();



};










// ======================================================
// PAYMENT MODAL
// ======================================================


window.openPayment=function(id,name){



document
.getElementById(
"paymentStudentId"
)
.value=id;



document
.getElementById(
"paymentStudentName"
)
.value=name;



document
.getElementById(
"paymentModal"
)
.style.display="flex";


};






window.closePaymentModal=function(){


document
.getElementById(
"paymentModal"
)
.style.display="none";


};









// ======================================================
// SAVE PAYMENT
// ======================================================


window.savePayment = async function(){



let id =

document
.getElementById(
"paymentStudentId"
)
.value;



let amount = Number(

document
.getElementById(
"paymentAmount"
)
.value

);



let receipt =

document
.getElementById(
"receiptNumber"
)
.value;



if(!amount){

alert("Enter payment amount");

return;

}



let fee=getFee(id);



let newPaid =

Number(fee.paid_fee)

+

amount;



let newDue = Math.max(

0,

Number(fee.total_fee)

-

newPaid

);





// save payment history

const {error:paymentError}=

await supabase

.from("fee_payments")

.insert({

student_id:id,

amount_paid:amount,

receipt_no:receipt,

payment_method:"Cash",

payment_date:new Date()

});





if(paymentError){

console.log(paymentError);

alert(paymentError.message);

return;

}





// update fee summary


const {error:feeError}=

await supabase

.from("fees")

.upsert({

student_id:id,

total_fee:fee.total_fee,

paid_fee:newPaid,

due_fee:newDue

},

{

onConflict:"student_id"

});





if(feeError){

alert(feeError.message);

return;

}





alert("Payment Saved Successfully");



closePaymentModal();


loadFeeData();


};

// ======================================================
// PAYMENT HISTORY
// ======================================================


window.showHistory=function(id){



let data = payments.filter(

p=>p.student_id===id

);



let box=document.getElementById(
"historyContent"
);



if(!box) return;



box.innerHTML="";



if(data.length===0){


box.innerHTML=
"<p>No Payment History Found</p>";


}

else{


data.forEach(p=>{


box.innerHTML += `


<div class="history-item">


<h4>Payment Receipt</h4>


Receipt No :
${p.receipt_no || "-"}


<br>


Amount Paid :
₹${p.amount_paid || 0}


<br>


Payment Method :
${p.payment_method || "-"}


<br>


Date :
${p.payment_date 
? new Date(p.payment_date).toLocaleDateString()
:"-"}



</div>


<hr>


`;



});


}




document
.getElementById(
"historyModal"
)
.style.display="flex";



};







window.closeHistoryModal=function(){


document
.getElementById(
"historyModal"
)
.style.display="none";


};









// ======================================================
// WHATSAPP
// ======================================================


window.sendWhatsApp=function(id){



let student = students.find(

s=>s.id===id

);



if(!student){

alert("Student not found");

return;

}



let fee=getFee(id);



if(!student.mobile){

alert("Mobile number missing");

return;

}




let message = `

🏫 Vision School ERP

Dear Parent,

Thank you for  fee payment.

 Student: ${student.full_name}
 Class: ${student.class_name}

 Total Fee: ₹${fee.total_fee}
 Fee Paid: ₹${fee.paid_fee}
 Reciept number : ${fee.receipt_no || "-"}
 Pending Fee: ₹${fee.due_fee}

Kindly clear the pending amount at the earliest.

Thank you for your cooperation.

– Principal
VISION – The School of Excellence

`;




let url =

"https://wa.me/91"

+

student.mobile

+

"?text="

+

encodeURIComponent(message);





window.open(
url,
"_blank"
);



};









// ======================================================
// SMS
// ======================================================


window.sendSMS=function(id){



let student = students.find(

s=>s.id===id

);



if(!student){

alert("Student not found");

return;

}



let fee=getFee(id);



let message=`


Vision School ERP


Student:
${student.full_name}


Class:
${student.class_name}


Total Fee:
₹${fee.total_fee}


Paid:
₹${fee.paid_fee}


Pending:
₹${fee.due_fee}



Thank you

`;





window.open(

"sms:"

+

student.mobile

+

"?body="

+

encodeURIComponent(message)

);



};









// ======================================================
// INITIAL LOAD
// ======================================================


window.onload=function(){


loadFeeData();


};