INSERT INTO public."module" (code, name)
VALUES
    ('customer', 'Customer'),
    ('product', 'Product'),
    ('human_resources', 'Human Resources'),
    ('sales', 'Sales'),
    ('reports', 'Reports')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.rights_catalogue (module_id, code, name)
SELECT m.id, seed.code, seed.name
FROM (
    VALUES
        ('customer', 'add_customer', 'Add Customer'),
        ('customer', 'edit_customer', 'Edit Customer'),
        ('customer', 'delete_customer', 'Delete Customer'),
        ('product', 'add_product', 'Add Product'),
        ('product', 'edit_product', 'Edit Product'),
        ('product', 'delete_product', 'Delete Product'),
        ('product', 'add_price', 'Add Price'),
        ('product', 'edit_price', 'Edit Price'),
        ('product', 'delete_price', 'Delete Price'),
        ('human_resources', 'add_job', 'Add Job'),
        ('human_resources', 'edit_job', 'Edit Job'),
        ('human_resources', 'delete_job', 'Delete Job'),
        ('human_resources', 'add_department', 'Add Department'),
        ('human_resources', 'edit_department', 'Edit Department'),
        ('human_resources', 'delete_department', 'Delete Department'),
        ('human_resources', 'add_employee', 'Add Employee'),
        ('human_resources', 'edit_employee', 'Edit Employee'),
        ('human_resources', 'delete_employee', 'Delete Employee'),
        ('human_resources', 'view_job_history', 'View Job History'),
        ('human_resources', 'add_job_history', 'Add Job History'),
        ('human_resources', 'edit_job_history', 'Edit Job History'),
        ('human_resources', 'delete_job_history', 'Delete Job History'),
        ('sales', 'add_sale', 'Add Sale'),
        ('sales', 'edit_sale', 'Edit Sale'),
        ('sales', 'delete_sale', 'Delete Sale'),
        ('sales', 'view_sale_detail', 'View Sale Detail'),
        ('sales', 'add_sale_detail', 'Add Sale Detail'),
        ('sales', 'edit_sale_detail', 'Edit Sale Detail'),
        ('sales', 'delete_sale_detail', 'Delete Sale Detail'),
        ('reports', 'view_top_customers', 'Top Customers'),
        ('reports', 'view_product_master_list', 'Product Master List'),
        ('reports', 'view_top_products', 'Top Products'),
        ('reports', 'view_active_employees', 'Active Employees'),
        ('reports', 'view_all_employees', 'All Employees'),
        ('reports', 'view_employee_job_history', 'Employee Job History'),
        ('reports', 'view_top_sales', 'Top Sales')
) AS seed(module_code, code, name)
JOIN public."module" AS m ON m.code = seed.module_code
ON CONFLICT (module_id, code) DO NOTHING;
