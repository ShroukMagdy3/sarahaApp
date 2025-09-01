import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/users.model.js";


export const sendMessage = async (req, res , next)=>{
    const{userId , content} = req.body;
    const userExist = await userModel.findOne({_id :userId , isDeleted:{$exists :false}});
    if(!userExist){
        return res.status(404).json({message:"user not found or freezed"});
    } 
    const message = await messageModel.create({userId ,content});
    return res.status(201).json({message:"Created" , message});
}


export const getAllMesg = async (req, res , next)=>{
    const messages = await messageModel.find({userId : req.user._id});
    return res.status(200).json({message:"done" , messages});


}

export const getMessage = async (req, res , next)=>{
    const { id } = req.params; 
    const message = await messageModel.find({userId : req.user._id , _id:id});
    return res.status(200).json({message:"done" , message});


}