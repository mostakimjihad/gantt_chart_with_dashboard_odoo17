# -*- coding: utf-8 -*-
##############################################################################
from odoo.http import request, route, Controller
from datetime import date
from collections import defaultdict


class ProjectDashboard(Controller):

    @route('/get/project/data', auth='user', type='json')
    def fetch_project_data(self):
        """
        When the user clicks on the project dashboard menu, this method will be called.
        :return: Dictionary of project, task, and resource data for Gantt chart
        """
        project_object = request.env['project.project']
        task_object = request.env['project.task']
        resource_object = request.env['hr.employee']  # Assuming hr.employee as the resource model
        today = date.today()

        # Fetch all projects
        project_ids = project_object.search([])

        # Initialize counters
        pending_today_count = 0
        deadline_crossed_count = 0
        projects_at_risk = 0

        # Dictionary to count subtasks under each parent task
        subtask_counters = defaultdict(int)

        # Prepare project data
        projects_data = []
        for project in project_ids:
            # Fetch tasks related to each project
            task_ids = task_object.search([('project_id', '=', project.id)])
            tasks_data = []

            # Check if project is at risk
            project_at_risk = False

            for task in task_ids:
                # Fetch resources assigned to the task
                resources = resource_object.search([('user_id', 'in', task.user_ids.ids)])  # Ensure 'user_ids' is correct

                # Prepare resources data list for the task
                resources_data = [{'id': resource.id, 'name': resource.name} for resource in resources]

                # Determine task ID format (main task or subtask)
                if task.parent_id:
                    # Increment subtask counter for this parent task
                    subtask_counters[task.parent_id.id] += 1
                    task_id = f"{task.parent_id.id}.{subtask_counters[task.parent_id.id]}"
                else:
                    task_id = str(task.id)

                task_data = {
                    'id': task_id,
                    'name': task.name,
                    'start_date': task.start_date,
                    'end_date': task.date_deadline,
                    'progress': task.stage_id.name,  # Example of progress using the stage name
                    'resources': resources_data  # Add resources data here
                }

                # Add parent key if it's a subtask
                if task.parent_id:
                    task_data['parent'] = str(task.parent_id.id)

                tasks_data.append(task_data)

                # Count tasks pending for today
                if task.date_deadline and task.date_deadline.date() == today and task.stage_id.name != 'Completed':
                    pending_today_count += 1

                # Count tasks where the deadline has passed
                if task.date_deadline and task.date_deadline.date() < today and task.stage_id.name != 'Completed':
                    deadline_crossed_count += 1
                    project_at_risk = True

            # If any task in the project has crossed the deadline, mark the project as at risk
            if project_at_risk:
                projects_at_risk += 1

            # Add project data along with tasks
            projects_data.append({
                'id': project.id,
                'name': project.name,
                'start_date': project.date_start,
                'tasks': tasks_data
            })

        # Prepare the data dictionary
        data_dct = {
            'projects_count': len(project_ids),
            'projects': projects_data,
            'tasks_pending_today': pending_today_count,
            'tasks_deadline_crossed': deadline_crossed_count,
            'projects_at_risk': projects_at_risk
        }

        print(data_dct)

        return data_dct
