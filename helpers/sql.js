const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/** Takes in data to update included in req.body and 
 * jsToSql, which is JS object key names converted to
 * lower_snake for SQL. 
 * 
 * if no keys, throw bad request error that we need data
 * 
 * otherwise, columns are created by mapping over keys inlcuded
 * in jsToSql (if it had to be converted) or colNames in 
 * dataToUpdate (if it didn't) and their coresponding values.
 * 
 * returns object of setCols: columns
 * values: values in dataToUpdate
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "), // ['"first_name"=$1' '"age"=$2']
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
