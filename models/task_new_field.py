from odoo import models, fields, api


class Project(models.Model):
    _inherit = 'project.task'

    start_date = fields.Date(string='Start Date')