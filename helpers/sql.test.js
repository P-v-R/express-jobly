const { sqlForPartialUpdate } = require("./sql.js")
const { BadRequestError } = require("../expressError")

const userData = {firstName: 'testchange'}
const userJsToSql = { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
const companyData = {name: 'testcompanyname', description: "this is a test"}
const companyJsToSql = { numEmployees: 'num_employees', logoUrl: 'logo_url' }

describe("SQL for partial update", function () {
    
    test("returns property formatted cols/vals obj for user", function () {
        expect(
          sqlForPartialUpdate(userData, userJsToSql)).toEqual(
                { setCols: '"first_name"=$1', values: [ 'testchange' ]
                });
    });

    test("returns property formatted cols/vals obj for company", function () {
        expect(
            sqlForPartialUpdate(companyData, companyJsToSql)).toEqual(
                {   setCols: '"name"=$1, "description"=$2',
                    values: [ 'testcompanyname', 'this is a test' ]
                  });
      });

      test("returns bad request error with no data", function () {
          try {
            expect(sqlForPartialUpdate({}, userJsToSql))     
        } catch (err){
            expect(err.message).toBe('No data')
            }
      });
});
