//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemschema={
  name: String
};
const Item = mongoose.model("Item", itemschema);
const item1=new Item({
  name:"Welcome to your very own To-Do list! :)"
});
const item2=new Item({
  name:"Click '+' to add to your To-Do list."
});
const item3=new Item({
  name:"<- Click the checkbox to remove the tasks you're done with."
});
const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({}, function(err, founditems){
    if(founditems.length==0){
      Item.insertMany([item1,item2,item3],function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully added items");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
    
  });
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname= req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listname=="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    })
  }
});
const listschema={
  name: String,
  items:[itemschema]
};

const List=mongoose.model("list",listschema);
app.get("/about", function(req, res){
  res.render("about");
});
app.get("/:customlistname",function(req,res){
  const customlistname =_.capitalize(req.params.customlistname);
  List.findOne({name:customlistname},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
        name:customlistname,
        items: [item1,item2,item3]
        });
        list.save();
        res.redirect("/"+customlistname);
    }
      else{
        res.render("list",{listTitle:foundlist.name,newListItems: foundlist.items});
    }
  }
  });
  
  
  
});



app.post("/delete", function(req,res){
  const listname=req.body.listname;
  const checkeditem= req.body.checkbox;
  
    if(listname=="Today"){
      Item.findByIdAndRemove(checkeditem,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Deleted item");
          res.redirect("/");
        }
      });
    }
    else{
      List.findOneAndUpdate({name:listname},{$pull:{items: {_id: checkeditem}}},function(err, foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
      });
    }
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
