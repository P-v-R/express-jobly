"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    description: "New Description",
    numEmployees: 1,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.create(newCompany);
    expect(company).toEqual(newCompany);

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        num_employees: 1,
        logo_url: "http://new.img",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Company.create(newCompany);
      await Company.create(newCompany);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });
});

/******************************* filterAll() */ 

/** find all companies that match filter parameters, 
   *  calls a tailored SQL query to match the query args 
   *  returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   */
describe("filterAll", function () {
  test("works: name param", async function () {
    let companies = await Company.filterAll({name: "c1"});
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    ]);
  });

  test("works: name param", async function () {
    let companies = await Company.filterAll({name: "c"});
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      }
    ]);
  });

  test("works: min/max employees", async function () {
    let companies = await Company.filterAll({minEmployees: 2, maxEmployees: 4});
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      }
    ]);
  });
  
  test("fails: min employees is NaN", async function () {
    try{
      await Company.filterAll({minEmployees: "notNumber"});
  
      console.log("NEVER SHOULD GET TO THIS LINE");
      fail();
    }catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    };
  });

});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.update("c1", updateData);
    expect(company).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let company = await Company.update("c1", updateDataSetNulls);
    expect(company).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove("c1");
    const res = await db.query(
        "SELECT handle FROM companies WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************ _whereClauseBuilder */  


describe("where clause builder", function(){
  test("all three params are passed (name, minEmployees, maxEmployees)", function(){
    
    expect(Company._whereClauseBuilder({name:"test", minEmployees:10, maxEmployees:100}))
            .toEqual({whereClause:"name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3", 
                      params:["%test%", 10, 100]});
    
  })
  test("one params are passed (name)", function(){
    expect(Company._whereClauseBuilder({name:"test"})).toEqual({whereClause:"name ILIKE $1",
                                                      params:["%test%"]});
    
  })
  test("one params are passed (minEmployee)", function(){
    expect(Company._whereClauseBuilder({minEmployees:10})).toEqual({whereClause:"num_employees >= $1",
                                                          params:[10]});
    
  })
  test("one params are passed (maxEmployee)", function(){
    expect(Company._whereClauseBuilder({maxEmployees:100})).toEqual({whereClause:"num_employees <= $1",
                                                           params:[100]});
    
  })
  test("two # employee params are passed (minEmployee, maxEmployee)", function(){
    expect(Company._whereClauseBuilder({minEmployees:10, maxEmployees:100})).
            toEqual({whereClause:"num_employees >= $1 AND num_employees <= $2",
                                                          params:[10, 100]});
    
  })
  test("name and one # filter passed (name, maxEmployee)", function(){
    expect(Company._whereClauseBuilder({name:"test", maxEmployees:100})).
            toEqual({whereClause:"name ILIKE $1 AND num_employees <= $2",
                                                          params:["%test%", 100]});
    
  })
  test("invalid query arg returns error", function(){
    try{
      expect(Company._whereClauseBuilder({potato:true}));
      fail();
    } catch(err){
      expect(err instanceof BadRequestError);
    }
  })

  test("string passed to minEmployee", function(){
    try{
      expect(Company._whereClauseBuilder({minEmployees:"onehundred"}));
      fail();
    } catch(err){
      expect(err instanceof BadRequestError);
    }
  })
})
