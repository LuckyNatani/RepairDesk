-- Migration: Add Admin access to Tasks table
-- Description: Grants users with the 'admin' role full CRUD access to tasks within their company.

-- Provide full access to tasks for 'admin' users in the same company
CREATE POLICY "Admin tasks access" ON tasks
    FOR ALL
    TO public
    USING (
        get_user_role(auth.uid()) = 'admin' AND 
        company_id = get_user_company(auth.uid())
    );
