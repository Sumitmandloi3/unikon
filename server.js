  
  ////////////////////////////////////project short  description //////////////////////////////////////////////////////////////////////////


  /*
This is a web application that allows users to buy and sell items. It is built using Node.js and Express framework, with MongoDB as the database for storing user information and item details.

The application supports the following features:
- User authentication: Users can sign up and log in to their accounts.
- Profile management: Users can edit their profile information, including name, email, password, and phone number.
- Item listing: Users can add items for sale, providing details such as item name, category, price, description, contact information, and location.
- Item search: Users can search for items based on the city.
- Product description: Users can view detailed information about a specific item.
- Contact and feedback: Users can send messages and feedback using the contact form.

The code uses various packages and modules, including Express, Multer for file uploading, Mongoose for database operations, Nodemailer for sending emails, and EJS as the templating engine for rendering views.

To run the application, make sure you have MongoDB installed and running on your system. Then, start the server by running 'npm start' or 'node app.js' command in the project directory. The server will start listening on port 4000.


*/

/***********************************import statements stared************************************************************ */
const express = require("express");
const bodyParser = require("body-parser");
var multer = require('multer');
const mongoose = require("mongoose");
var fs = require('fs');
var path = require('path');
const mailgen= require('mailgen');
const nodemailer = require('nodemailer');
const cookieParser= require('cookie-parser');
var pn=1;
/*************************************import statement ended***************************************************************************   */


/**************************************different routes*******************************************************************8 */
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cookieParser());



//for image uploading..............
var storage = multer.diskStorage({
    destination:"./public/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname));
    }
});
 
var upload = multer({ storage: storage }).single("img");
/***********************************************connecting mongodb datatbase ************************************************8 */
//connect mongodb....
mongoose.connect("mongodb://localhost:27017/unikon_db", { useNewUrlParser: true });


/********************************defining mongodb schema*******************************************************************************************8 */
// define schema.....
const usertable_schema ={
  name: String,
  email:String,
  password:String,
  phone_no:Number,
  user_name:String
};
const contact_schema ={
  name: String,
  email:String,
  subject:String,
  phone_no:Number,
  messages:String
};
const item_details_schema = {
  name_of_item: String,
  category_of_item: String,
  price_of_item: Number,
  address: String,
  img:String,
  description: String,
  contact_detail: String,
  city:String,
  pin:Number,
  state:String,
  user_name:String,
  seller_name: { type: String, required: true }
};
//create tables.
const item_details = mongoose.model("item_details", item_details_schema);
const user_details = mongoose.model("user_details",usertable_schema);
const contact_details = mongoose.model("contact_details", contact_schema);

/*********************************************************************************get statements started ************************************************************************************** */
//home page ////////////////////////////////////////////////////////////////
app.get("/",function(req,res){
  
  res.clearCookie('user_name');
  res.render("homepage",{message:""});
  
})
//////////////////////////////login page /////////////////////////////////////////
app.get("/login",function(req,res){
  pn=1;
  res.render("box",{message:""});
})
///////////////////////////////rendering after login page //////////////////////////////////////////////////////////
app.get("/afterlogin",function(req,res){
  pn=1;
  async function items(){
    const results = await item_details.find({});
          const cnt = await item_details.countDocuments({});
          res.render("afterloginpage", { itemlist: results, pagenumber: pn, count: cnt });
  }
  items();
})
/////////////////////////////////////redmore about website ////////////////////////////////////////////////
app.get("/readmore",function(req,res){
  res.render("readmore");
});
//////////////////////////////rendering profile page /////////////////////////////////////////

app.get("/profile",function(req,res){
  res.render("editprofile",{message:""});
})

//////////////////////////////////// page to add item //////////////////////////////////////////////////////////////
app.get("/profile/itemdetails",function(req,res){
  res.render("itemdetail",{message:""});
})

//////////////////////////////////////////managing products like deleting etc //////////////////////////////////////////
app.post("/profile/manage_product",function(req,res){
  const uname=req.cookies.user_name;
  
    cnt=0;
    async function searchitem() {
     const results = await item_details.find({user_name:uname});
    
     res.render("result", { user: results}); 
    }
    searchitem();
});
/********************************************************get statements ends **************************************************************************************************/



/***********************************************************post statements started ******************************************************************8 */
////////////////////////////////////////deleting product that user want //////////////////////////////////////////////////////////////////////
app.post("/delete-product",function(req,res){
  const product=req.body.productId;
  
    cnt=0;
    async function deleteitem() {
      try {
        const result = await item_details.deleteOne({ img: product });
        if (result.deletedCount === 1) {
          console.log(`Item with name '${product}' deleted successfully.`);
        } else {
          console.log(`Item with name '${product}' not found.`);
        }
      } catch (err) {
        console.error(err);
      }
     
    }
    deleteitem().then(() => {
      // Perform any necessary actions after the deletion

      // Redirect back to the result page or any other appropriate page
      const uname=req.cookies.user_name;
      async function searchitem() {
        const results = await item_details.find({user_name:uname});
       
        res.render("result", { user: results}); 
       }
       searchitem();
    })
    .catch((err) => {
      console.error(err);
      // Handle any errors that occurred during deletion
      // Render an error page or display an appropriate message to the user
    });
});

/////////////////////////////////////////// storing product description ///////////////////////////////////////////////////////////////////////////////////////////////
app.post("/profile/itemdetails",upload,function(req,res){

        const iname= req.body.itemname;
        const category=req.body.category;
        const contact=req.body.contact;
        const sellername=req.body.seller;
        const address=req.body.address;
        const city=req.body.city.toLowerCase();
        const pin=req.body.pin;
        const state=req.body.state;
        const price=req.body.price;
        const desc=req.body.desc;
        const img=req.file.filename;
        const uname=req.cookies.user_name;
        //console.log(uname);
        const item1 = new item_details({
           user_name:uname,
          name_of_item: iname,
          category_of_item: category,
          price_of_item: price,
          address: address,
          img: img,
          description: desc,
          contact_detail: contact,
          city:city,
          pin:pin,
          state:state,
          seller_name:sellername,
        });
        async function saveItem() {
    
          try {
            await item1.save();
            console.log("Item saved successfully!");
            res.render("itemdetail",{message:"item save succesfully !!"});
           
          } catch (error) {
            console.log(error);
            res.render("itemdetail",{message:"error try again!!"});
          }
        }
        saveItem();
        
});

////////////////////////////////////////////////////////////// making user profile storing it into mongodb datatbase///////////////////////////////////////////////////////////////////////
app.post("/profile",function(req,res){
     const upname=req.body.name;
     const upemail=req.body.email;
     let password=req.body.password;
     const phonenumber=req.body.phoneno;
     let clutter="";
     let str = password.split("")
     str.forEach(element => {
         clutter += `&#128${(element.charCodeAt())} `
         // console.log((element.charCodeAt()) * Math.floor(Math.random() * 10))
     });
     password=clutter;
     async function updatedata(){ 
     const result =await user_details.findOneAndUpdate({email:upemail},{
      $set :{
        user_name:upname,
        password: password,
        phone_no:phonenumber,
      }
     },{
      new: true,
      useFindAndModify: false
     })

}
updatedata();
res.render("editprofile",{message:"data has been modified!"});
});

///////////////////////////////////////////////////// checking login information and storing session cookies /////////////////////////////////////////////////////////////////

app.post("/login", function (req, res) {
  const username = req.body.uname;
  let password = req.body.psw;

  user_details
    .findOne({ user_name: username })
    .then(async (data) => {
      if (data) {
        const storedPassword = data.password;

      
        var str2 = storedPassword.split("&#128");
      
        let flag=1;
        let i=-1;
        str2.forEach(element => {
           if(i!=-1&&password[i]!=String.fromCharCode(element))flag=0;
           i++;
         });

        // Compare the entered password with the decrypted password
        //console.log(password+" "+decryptedData);
       // console.log(flag);
      
        if (flag==1) {
          res.cookie('user_name', username, {
            httpOnly: true
          });
          const results = await item_details.find({});
          const cnt = await item_details.countDocuments({});
          res.render("afterloginpage", { itemlist: results, pagenumber: pn, count: cnt });
        } else {
          res.render("box", { message: "Please enter a valid username or password!" });
        }
      } else {
        res.render("box", { message: "Please enter a valid username or password!" });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});
//////////////////////////////////////////////// page that describe the product or item ////////////////////////////////////////////////////////////////////////////////////
app.post("/productdescription",(req,res)=>{
    
  const img = req.body.img;
  const product_name= req.body.name_of_item;
  const product_price= req.body.price_of_item;
  const product_address = req.body.address;
   
    async function searchitem() {
      const results = await item_details.find({name_of_item:product_name,price_of_item:product_price,address:product_address});
     
      res.render("product_desc", {ProductName:results,img:img}); 
     }

     searchitem();
     
   
})
////////////////////////////////////////////////// search item based on city ///////////////////////////////////////////////////////////////////////////
app.post("/searchbycity",function(req,res){
    const city=req.body.city.toLowerCase();
    cnt=0;
    async function searchitem() {
     const results = await item_details.find({city:city});
     const cnt = await item_details.countDocuments({});
     res.render("afterloginpage", { itemlist: results,pagenumber:pn,count:cnt}); 
    }
    searchitem();
});

/////////////////////////////////////////////// storing information and feedback of customers /////////////////////////////////////////////////////////////////////
app.post("/contact",function(req,res){
     const name=req.body.name;
     const email=req.body.email;
     const phone_no=req.body.phonenumber;
     const sub= req.body.subject;
     const mess=req.body.subject; 
     const item1 = new contact_details({
     
      name: name,
      email: email,
      subject:sub,
      phone_no: phone_no,
      messages: mess
    });
    async function saveItem() {

      try {
        await item1.save();
        console.log("Item saved successfully!");
        res.render("feedback");
       
      } catch (error) {
        console.log(error);
        res.render("homepage",{message:"error try again!!"});
      }
    }
    saveItem();
});


////////////////////////////////////signup page also send email to user email////////////////////////////////////////////////////////////////
app.post("/signup",function(req,res){
 
     
     const username=req.body.username;
     const email=req.body.email;
     let password=req.body.password; 
   
     let clutter="";
     let str = password.split("")
     str.forEach(element => {
         clutter += `&#128${(element.charCodeAt())} `
         // console.log((element.charCodeAt()) * Math.floor(Math.random() * 10))
     });
     password=clutter;;

   // email sending
     let config ={
      service: 'gmail',
      auth :{
        user:'unikon2023@gmail.com',
        pass:'dfgmutlabvhqxvlr'
      }
     }
    let transporter= nodemailer.createTransport(config);
    let mailgenerator= new mailgen({
       theme: "default",
       product:{
         name: "unikon",
         link:"https://mailgen.js/"
       }
    })
    let response ={
      body:{
        intro:username,
        table:{
           data:{
            description:{ f:"Welcome to Unikon! We're thrilled to have you on board and would like to extend our warmest greetings.",
             s:"Congratulations on successfully logging into your Unikon account. You now have access to a world of exciting features and services designed to enhance your experience Should you have any questions, concerns, or need any assistance, our support team is always here to help.",
             t:"Feel free to reach out to us . Thank you once again for joining Unikon. We look forward to serving you and ensuring a seamless and enjoyable experience. " }
           }
        },
        outro:"looking forward to do more business!!"
      }
    }
     let mail=mailgenerator.generate(response);
     let message={
      from:"unikon2023@gmail.com",
      to:email,
      subject:"you login successfully",
      html:mail

     }
     transporter.sendMail(message).then(()=>{
      console.log("send succesfully !!");
     }).catch(error=>{
      console.log("error!!");
     });
     const item1 = new user_details({
     
      email: email,
      password: password,
      user_name: username
    });
    async function saveItem() {

      try {
        await item1.save();
        console.log("Item saved successfully!");
        res.render("box",{message:"signin succesfully kindly login !!"});
       
      } catch (error) {
        console.log(error);
        res.render("box",{message:"error try again!!"});
      }
    }
    saveItem();
});

//////////////////////////////// show next items //////////////////////////////////////////////////////////////////////////

app.post("/next",function(req,res){
      pn++;
      async function nextelement() {

        try {
          const results = await item_details.find({});
          const cnt = await item_details.countDocuments({});
        res.render("afterloginpage", { itemlist: results,pagenumber:pn,count:cnt}); 
        }
        catch{
          console.log("error");
        }
      }
    nextelement();
});
/*****************************************************post statements ended**********************************************8 */

/*******************************listening to port 4000*****************************************************************************/
app.listen(4000,function(){
  console.log("server started at port 4000");
})
/*************************************end************************************************************************************************************  */