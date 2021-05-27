import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';

export default class AuthController {
  public async login ({response,request,auth}: HttpContextContract) {
    const {email,password} = request.only(["email","password"]);
    try {
      const {token} = await auth.use('api').attempt(email, password);
      return response.json({user:auth.user,token});
    } catch {
      return response.badRequest('Invalid credentials')
    }
  
  }

  public async register ({request,response,auth}: HttpContextContract) {
    const {email,password} = request.only(["email","password"]);
    
    const user =  await User.findBy("email",email);
    if(user){
    return  response.badRequest('email already exists');
    }
    
    const newUser = await User.create({
      email,
      password
    });

    const {token} = await auth.use('api').attempt(email, password);

    return response.json({user:newUser,token});
  }

  public async update ({request,response,auth}: HttpContextContract) {
    const {email,password} = request.only(["email","password"]);
    
    const user = auth.user;

    if(!user) return response.badRequest();

    user.email = email;
    user.password = password;
    await user.save();

    return response.json({user});
  }
  

}
