import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Favorite from 'App/Models/Favorite'
import Env from '@ioc:Adonis/Core/Env'
import md5 from 'md5';
import axios from 'axios';
import User from 'App/Models/User';


export default class CharactersController {
  public async index ({response,auth}: HttpContextContract) {

    const user = await User.find(auth.user?.id);
    await user?.load("favorites");
    const favorites = user?.favorites
    

    return response.json(favorites)
  }

  public async getCharacter ({response,request,auth}: HttpContextContract) {
    const {limit = 10,offset = 0} = request.qs()
    const publicKey = Env.get('API_KEY_MARVEL_PUBLIC');
    const privateKey = Env.get('API_KEY_MARVEL_PRIVADO');
    const ts = 1585699200;
    const hash = md5(`${ts}${privateKey}${publicKey}`);
    const {data:{data}} = await axios.get(
      `https://gateway.marvel.com:443/v1/public/characters?limit=${limit}&offset=${offset}&apikey=${publicKey}&hash=${hash}&ts=${ts}`,
    );
    const {results:res,count,total,offset:off,limit:lim} = data;

    const results = res.map((character) => {
     const index =  auth.user?.favorites?.findIndex((fav) => fav.idCharacter === character.id) || -1;
     return ({
       favorite: index === -1 ? false : true,
       name:character.name,
       thumbnail:`${character.thumbnail.path}.${character.thumbnail.extension}`,
       description:character.description,
       idCharacter:character.id
     })
    })
    return response.json({results,count,total,offset:off,limit:lim});
  }

  public async store ({response,request,auth}: HttpContextContract) {
    const {idCharacter,name,description,thumbnail} = request.only(["idCharacter","name","thumbnail","description"]);
     
    if(!idCharacter && !name && !thumbnail && !description) return response.badRequest();
 
    const favorite = new Favorite();
     await favorite.fill({idCharacter,name,thumbnail,description,userId:auth.user?.id}).save();
    
    const user = await User.find(auth.user?.id);
    await user?.load("favorites");
    const favorites = user?.favorites

    return response.json(favorites);
  }

  public async destroy ({response,request,auth}: HttpContextContract) {
    const {idCharacter} = request.only(["idCharacter"]);

    const user = await User.find(auth.user?.id);
    await user?.load("favorites");
    const favorites = user?.favorites
    
    const [fav] = favorites?.filter((fav) => fav.idCharacter === idCharacter);
    const favPersist = await Favorite.find(fav?.id);
    await favPersist?.delete()
    return response.status(201);

  }
}
