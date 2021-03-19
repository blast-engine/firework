import { FullNodeQuery } from '../queries'
import { ModelV2 } from './model'
import { pathIsValid, pathAsArray, pathAsString } from './path-utils'

/**
 *  def @StringPath = ex: 'user/some/thing'
 *  def @ArrayPath = ex: [ 'user', 'some', 'thing' ]
 *  def @Path = @StringPath || @ArrayPath
 *  def @AbsolutePath = @Path that starts from db root
 *    - def @AbsoluteStringPath
 *    - def @AbsoluteArrayPath
 *  def @NodeRelativePath = @Path that starts from node root
 *    - def @NodeRelativeStringPath
 *    - def @NodeRelativeArrayPath
 *  def @LeafValue = string | number | boolean | null
 *  def @Update = @LeafValue || { [ @StringPath ]: @Update } 
 *  def @AbsoluteUpdate = { [ @AbsoluteStringPath ]: @Update }
 *  def @Value = @LeafValue || { [ string ]: @Value } 
 */

export class NodeRefV2 extends ModelV2 {

  /**
   * @overridable
   * @returns full version of this node class
   */
  static ref() {
    return NodeRefV2
  }
  
  /**
   * @overridable
   * @returns full version of this node class
   */
  static full() {
    return NodeFullV2
  }

  constructor(args) {
    super(args)
    const { path } = args

    if (!pathIsValid(path)) this.throwInvalidPath(path)
    this._path = pathAsArray(path)
  }

  /**
   * @overridable
   * @returns @Query
   */
  query() {
    return new FullNodeQuery({
      path: this.strPath(),
      instantiate: (data) => this.spinoff(this.class().full(), { 
        path: this.path(), 
        data 
      })
    })
  }

  /**
   * @param path: @NodeRelativePath
   * @param update: @Update
   * @returns @AbsoluteUpdate
   */
  set(path, update) {
    return this.update({ [pathAsString(path)]: update })
  }

  /**
   * @param relativeUpdate: @Update
   * @returns @AbsoluteUpdate
   */
  update(relativeUpdate) {
    return { [this.strPath()]: relativeUpdate }
  }

  /**
   * @returns @AbsoluteUpdate
   */
  delete() {
    return this.update(null)
  }

  /**
   * @param subPath?: @NodeRelativePath
   * @returns @AbsoluteArrayPath
   */
  path(subPath) {
    return this._path.concat(pathAsArray(subPath))
  }
  
  /**
   * @param subPath?: @NodeRelativePath
   * @returns @AbsoluteStringPath
   */
  strPath(subPath) {
    return pathAsString(this.path(subPath))
  }

}

export class NodeFullV2 extends NodeRefV2 {
    
  /**
   * @overridable
   * @returns full version of this node class
   */
  static ref() {
    return NodeRefV2
  }

  /**
   * @overridable
   * @returns full version of this node class
   */
   static full() {
    return NodeFullV2
  }
    
  constructor(args) {
    super(args)
    const { data } = args
    
    this._data = data
    this._cache = {}
  }

  /**
   * @param path: @NodeRelativePath
   * @returns @Value
   */
  get(path, update) {
    return this._data
  }

  // move away
  getAsArray(path) {
    if (!path) 
  }
} 