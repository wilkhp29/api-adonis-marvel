import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Favorite extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId:number
  
  @column({columnName:"idCharacter"})
  public idCharacter:string
  

  @column()
  public name:string
  
  @column()
  public thumbnail:string
  
  @column()
  public description:string
  
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
