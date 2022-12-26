## User initialisation with super admin
The transcomm-backend creates a super admin user in the database on initial deployment. The username (email) and password are set in the .env (SUPERADMIN_EMAIL and SUPERADMIN_HASHED_PASSWORD respectively). This user can be used to add the first admin user to system. Note: the password is hashed using bcrypt set with 10 rounds. You can therefore set your own default password to your needs. However, the system requires you to change the password on the first login.

### IMPORTANT SECURITY NOTE
Note that this approach introduces a security risk of having such a powerful account on production that cannot be deleted or locked. The account in theory does have unlimited login attempts. It's the responsibility of the system user to store the password of this account in a secure matter to prevent unauthorized access.

### Steps
1. Deploy the application.
2. Login with the email and (unhashed) password of the super admin set in the .env.
3. Change the password of the super admin using the password reset page shown on screen. The password needs to be changed from the one set in the .env before you can add an admin to the database.
4. Navigate to the User Management tab.
5. Add the first admin to the application.
6. Use the application as intended.

### Additional notes
- Make sure the SUPERADMIN_HASHED_PASSWORD variable is put between single quotes ('). Otherwise the '$' is not escaped and the password is incorrectly put in the database. Login will then fail.
- The super admin can ONLY create new admin users. It cannot view or edit any other data in the system.
- The account cannot be deleted
- The account cannot be locked after too many wrong login attempts.
- The account is created on the first system deploy (when it is not in database already)
- If the system reboots when there is already a super admin account in the database, the password of this account is not overwritten by the default password in the .env
- If the password of the super admin account is lost by the system user. The way to reset this account is to manually drop the super admin user from the database and then redeploy the application. A new super admin account is then created with the hashed default password in the .env and the above mentioned steps can then be followed again.