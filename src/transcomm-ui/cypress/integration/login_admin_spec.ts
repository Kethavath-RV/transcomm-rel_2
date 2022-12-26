describe('The Login Page', () => {
  // This test requires a user to be created wtih email: admin@email.com and password: Helloworld1!Helloworld1!
  it('logs in successfully', () => {
    Cypress.Cookies.debug(true);

    cy.visit('http://localhost:4200/login'); // change URL to match your dev URL

    cy.get('#email').type('admin@email.com'); //.should('have.value', 'fake@email.com')

    cy.get('[type="password"]').type('Helloworld1!Helloworld1!');

    cy.get('[type="submit"]').click();

    cy.url().should('include', '/users'); // => true
  });
});
