"use strict";
const { BadRequestError } = require("../expressError");

/**  function for converting variable user inputs to SQL queries when patching in
 *   (updating) a DB record for user or company entry, 
 * TAKES IN :
 *        dataToUpdate OBJ  => {firstName: 'Joel', password:"newPw"} 
 *        jsToSql OBJ => {firstName: "first_name",lastName: "last_name",isAdmin: "is_admin"} 
 * RETURNS :
 *      {   setCols: '"first_name"=$1, "password"=$2',
                    values: [ 'Joel', 'newPW' ]}
*/        

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Joel', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "), // '"first_name"=$1' '"age"=$2'
    values: Object.values(dataToUpdate),
  };
}

/** builds a WHERE clause - 
 * intakes queryArgs from /companies GET and 
 * returns dynamic WHERE clause
 * 
 *     in ==> {name:"test", minEmployee:0, maxEmployee: 100}
 *      returns object {whereClause: "WHERE name ILIKE '%1%' num_...",
 *                                     params: [name, minEmployee, maxEmployee]}
 * 
 */
function whereClauseBuilder( { name, minEmployees, maxEmployees } ){

  let whereList = []
  let params = []
  let counter = 1
  if (name !== undefined){
    whereList.push(`name ILIKE '%$${counter}%'`)
    params.push(name)
    counter++
  }
  if (minEmployees !== undefined){
    whereList.push(`num_employees > $${counter}`)
    params.push(minEmployees)
    counter++
  }
  if (maxEmployees !== undefined){
    whereList.push(`num_employees < $${counter}`)
    params.push(maxEmployees)
    counter++
  }
  let whereClause = whereList.join(" AND ")
  // console.log("WHERE LIST ====>", whereList)
  // console.log("FUNC RESULT ", { whereClause, params})
  return { whereClause, params} // {" ", [ ]}
}

module.exports = { sqlForPartialUpdate, whereClauseBuilder };

