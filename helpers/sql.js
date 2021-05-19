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
 */
function whereClauseBuilder(queryArgs){
  const { name, minEmployees, maxEmployees } = queryArgs;
  let whereList = []
  let params = []
  let counter = 1
  if (name !== undefined){
    whereString.push(`name ILIKE $${counter}`)
    params.push(name)
    counter++
  }
  if (minEmployees !== undefined){
    whereString.push(`num_employees > $${counter}`)
    params.push(minEmployees)
    counter++
  }
  if (maxEmployees !== undefined){
    whereString.push(`num_employees < $${counter}`)
    params.push(maxEmployees)
    counter++
  }
  let whereClause = whereList.join(" AND ")
  return { whereClause, params}
}

module.exports = { sqlForPartialUpdate, whereClauseBuilder };

