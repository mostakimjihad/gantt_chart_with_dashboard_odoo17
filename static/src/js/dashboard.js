/** @odoo-module */

import {registry} from '@web/core/registry'
const {Component, onWillStart, useState} = owl
import {jsonrpc} from "@web/core/network/rpc_service"

export class ProjectDashboard extends Component {
    setup() {
        this.project_state = useState({
            projects_count: 0,
            projects: [],
            tasks_pending_today: 0,
            tasks_deadline_crossed: 0,
            projects_at_risk: 0,
            selected_project: null,
        });

        onWillStart(this.onWillStart);
    }

    // Event
    async onWillStart() {
        await this.loadExternalGanttLibrary();
        await this.fetchDataProject();
    }

    onProjectChange(ev) {
        const selected_project_id = parseInt(ev.target.value);
        const selected_project = this.project_state.projects.find(p => p.id === selected_project_id);
        this.project_state.selected_project = selected_project;
        this.initGanttChart();  // Load the selected project's tasks in the Gantt chart
    }

    // Load the DHTMLX Gantt chart library dynamically
    async loadExternalGanttLibrary() {
        const ganttScript = document.createElement("script");
        ganttScript.src = "https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js";
        ganttScript.onload = () => {
            const ganttStylesheet = document.createElement("link");
            ganttStylesheet.rel = "stylesheet";
            ganttStylesheet.href = "https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css";
            document.head.appendChild(ganttStylesheet);
        };
        document.head.appendChild(ganttScript);
    }

    // Fetch project data
    fetchDataProject() {
        var self = this;
        jsonrpc("/get/project/data", {}).then(function(data_result) {
            self.project_state.projects_count = data_result.projects_count;
            self.project_state.projects = data_result.projects;
            self.project_state.tasks_pending_today = data_result.tasks_pending_today;
            self.project_state.tasks_deadline_crossed = data_result.tasks_deadline_crossed;
            self.project_state.projects_at_risk = data_result.projects_at_risk;
        });
    }

    formatDatePetty(inputDate) {
        if (inputDate == false) {
            return '01-12-2024';
        }
        const datePart = inputDate.split(' ')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}-${month}-${year}`;
    }

    // Initialize Gantt chart with project data
    initGanttChart() {
        const tasks = {
            data: [],
            links: []
        };

        if (this.project_state.selected_project) {
            this.project_state.selected_project.tasks.forEach((task) => {

                const resourceNames = task.resources ? task.resources.map(r => r.name).join(", ") : "";
                const taskText = `${task.name} (${resourceNames})`;  // Add resources to task name
                tasks.data.push({
                    id: task.id,
                    text: taskText,
                    start_date: this.formatDatePetty(task.start_date),
                    end_date: this.formatDatePetty(task.end_date),
                    progress: task.progress === 'Done' ? 1 : 0,
                    parent: task.parent ? task.parent : 0
                });
            });
        }

        // Initialize Gantt chart with DHTMLX
        if (window.gantt) {
            gantt.init("gantt_here");  // Render Gantt chart
            gantt.clearAll();  // Clear any previous data
            const tasks_hard = {
               "data": [
                            {
                              "id": "1",
                              "text": "Project Initiation (Alice, Bob)",
                              "start_date": "01-11-2024",
                              "end_date": "05-11-2024",
                              "progress": 0.5,
                              "resources": [
                                { "id": "R1", "name": "Alice" },
                                { "id": "R2", "name": "Bob" }
                              ]
                            },
                            {
                              "id": "1.1",
                              "text": "Kickoff Meeting",
                              "start_date": "01-11-2024",
                              "end_date": "01-11-2024",
                              "progress": 1,
                              "parent": 1,
                              "resources": [
                                { "id": "R1", "name": "Alice" },
                                { "id": "R2", "name": "Bob" }
                              ]
                            },
                            {
                              "id": "1.2",
                              "text": "Initial Setup",
                              "start_date": "02-11-2024",
                              "end_date": "05-11-2024",
                              "progress": 0.5,
                              "parent": 1,
                              "resources": [
                                { "id": "R1", "name": "Alice" }
                              ]
                            },
                            {
                              "id": "2",
                              "text": "Requirement Analysis (Charlie, Alice)",
                              "start_date": "06-11-2024",
                              "end_date": "10-11-2024",
                              "progress": 0.3,
                              "resources": [
                                { "id": "R3", "name": "Charlie" },
                                { "id": "R1", "name": "Alice" }
                              ]
                            },
                            {
                              "id": "2.1",
                              "text": "Gather Requirements",
                              "start_date": "06-11-2024",
                              "end_date": "07-11-2024",
                              "progress": 0.6,
                              "parent": 2,
                              "resources": [
                                { "id": "R3", "name": "Charlie" }
                              ]
                            },
                            {
                              "id": "2.2",
                              "text": "Analyze Feasibility",
                              "start_date": "08-11-2024",
                              "end_date": "10-11-2024",
                              "progress": 0.2,
                              "parent": 2,
                              "resources": [
                                { "id": "R3", "name": "Charlie" },
                                { "id": "R1", "name": "Alice" }
                              ]
                            },
                            {
                              "id": "3",
                              "text": "Design Phase (Bob, Dana)",
                              "start_date": "11-11-2024",
                              "end_date": "15-11-2024",
                              "progress": 0.2,
                              "resources": [
                                { "id": "R2", "name": "Bob" },
                                { "id": "R4", "name": "Dana" }
                              ]
                            },
                            {
                              "id": "4",
                              "text": "Development Phase (Charlie, Eve)",
                              "start_date": "16-11-2024",
                              "end_date": "25-11-2024",
                              "progress": 0,
                              "resources": [
                                { "id": "R3", "name": "Charlie" },
                                { "id": "R5", "name": "Eve" }
                              ]
                            },
                            {
                              "id": "5",
                              "text": "Testing & QA (Dana, Alice)",
                              "start_date": "26-11-2024",
                              "end_date": "30-11-2024",
                              "progress": 0,
                              "resources": [
                                { "id": "R4", "name": "Dana" },
                                { "id": "R1", "name": "Alice" }
                              ]
                            }
                          ],
                          "links": [
                            { "id": 1, "source": 1, "target": 2, "type": "0" },
                            { "id": 2, "source": 2, "target": 3, "type": "0" },
                            { "id": 3, "source": 3, "target": 4, "type": "0" },
                            { "id": 4, "source": 4, "target": 5, "type": "0" }
                          ]
            };
//            console.log(tasks_hard)
            console.log(tasks)
            console.log(tasks_hard)
            gantt.parse(tasks);  // Load new task data into the Gantt chart

        }
    }

    _onClickProjects() {
        console.log("Project clicked");
        var projects = this.project_state.projects;
        if (projects.length > 0) {
            console.log(projects); // Show project details in the console
        }
    }
}

ProjectDashboard.template = "ProjectDashBoardMain";
registry.category("actions").add("project_dashboard_main", ProjectDashboard);
