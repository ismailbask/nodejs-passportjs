const sessionControl=(req,res,next)=>{
    if(req.isAuthenticated()){
        return next();//passport js den gelen metod. eğer oturum açılmışsa true gelecek.
    } 
    else{
        req.flash('error',['Lütfen önce oturum açın!']);
        res.redirect('/login');
        
    }
    
};
const successSession=(req,res,next)=>{
    if(!req.isAuthenticated()){
        return next();//passport js den gelen metod. eğer oturum açılmışsa true gelecek.
    } 
    else{

        res.redirect('/admin');
        
    }
    
};
module.exports={
    sessionControl,
    successSession
}   