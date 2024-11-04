# -*- coding: utf-8 -*-
{
    'name': 'Odoo Project Dashboard',
    'version': '17.0.1.0.0',
    'category': 'project',
    'summary': """
    Get a Detailed Project Info and Gantt View.
    """,
    'description': """
    In this dashboard user can get the Detailed Information about Project, Task, 
    Employee, Hours recorded, Total Margin and Total Sale Orders.
    """,
    'author': 'Mostakim Jihad',
    'depends': ['sale_management', 'project', 'sale_timesheet'],
    'data': [
        'views/start_date.xml',
        'views/views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'odoo-dashboard-tut-04/static/src/css/dashboard.css',
            'odoo-dashboard-tut-04/static/src/js/dashboard.js',
            'odoo-dashboard-tut-04/static/src/xml/dashboard.xml',
        ]},
    'images': [],
    'installable': True,
    'application': False,
    'auto_install': False,
}
