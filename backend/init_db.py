from __future__ import annotations

import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "bpis_system.db"


SCHEME_SEED_DATA = [
    {
        "name": "PM SHRI",
        "category": "Education",
        "description": "PM Schools for Rising India upgrades selected government schools into model institutions with modern infrastructure, digital learning, and stronger classroom quality.",
        "working_process": "States and Union Territories nominate schools, the central government evaluates readiness, approved schools receive support for infrastructure and pedagogy, and progress is tracked through quality benchmarks.",
    },
    {
        "name": "Samagra Shiksha Abhiyan",
        "category": "Education",
        "description": "Samagra Shiksha is an integrated school education programme focused on access, equity, inclusion, and better learning outcomes from pre-primary to senior secondary levels.",
        "working_process": "Annual state education plans are prepared, funds are shared between central and state governments, and districts implement teacher support, infrastructure, and student inclusion interventions.",
    },
    {
        "name": "Beti Bachao Beti Padhao",
        "category": "Education",
        "description": "Beti Bachao Beti Padhao promotes the survival, protection, and education of the girl child while addressing gender bias and declining child sex ratio.",
        "working_process": "District administrations run awareness campaigns, coordinate with education and health departments, and monitor enrolment and girl-child welfare indicators through local outreach.",
    },
    {
        "name": "Saakshar Bharat Mission",
        "category": "Education",
        "description": "Saakshar Bharat Mission focuses on adult literacy, especially for women, by improving basic reading, writing, numeracy, and functional learning opportunities.",
        "working_process": "Local learning centres identify non-literate adults, organize volunteer-led classes, provide simple learning material, and assess literacy gains through community-level monitoring.",
    },
    {
        "name": "PM Poshan Yojana",
        "category": "Education",
        "description": "PM Poshan provides hot cooked meals to school children to improve nutrition, classroom attendance, and retention in government and aided schools.",
        "working_process": "Funds and food grains are allocated to states, schools arrange meal preparation and delivery, and education departments oversee nutrition standards, hygiene, and coverage.",
    },
    {
        "name": "PM-JAY",
        "category": "Health",
        "description": "PM-JAY provides health insurance coverage for eligible poor and vulnerable families to access secondary and tertiary hospital care without catastrophic out-of-pocket expenditure.",
        "working_process": "Eligible families are identified from beneficiary databases, e-cards are generated, empanelled hospitals deliver cashless treatment, and claims are digitally processed through the scheme platform.",
    },
    {
        "name": "PM Jan Arogya Yojana",
        "category": "Health",
        "description": "PM Jan Arogya Yojana is the flagship health assurance component of Ayushman Bharat that supports cashless hospitalization for targeted beneficiary families.",
        "working_process": "Beneficiary verification is completed at enrolment points or hospitals, treatment packages are approved through empanelled facilities, and reimbursement is settled through monitored digital claims.",
    },
    {
        "name": "National Health Mission",
        "category": "Health",
        "description": "National Health Mission strengthens public health systems, maternal and child services, disease control, and primary healthcare delivery across rural and urban India.",
        "working_process": "States submit programme implementation plans, funds flow through mission mechanisms, local health institutions execute service delivery, and outcomes are reviewed through regular health indicators.",
    },
    {
        "name": "Pradhan Mantri Surakshit Matritva Abhiyan",
        "category": "Health",
        "description": "This programme ensures quality antenatal care for pregnant women, especially during the second and third trimesters, through fixed-day check-up services.",
        "working_process": "Public health facilities organize designated monthly ANC days, doctors screen and classify high-risk pregnancies, and follow-up referrals are coordinated for safer maternal care.",
    },
    {
        "name": "Poshan Abhiyan",
        "category": "Health",
        "description": "Poshan Abhiyan aims to reduce stunting, undernutrition, anaemia, and low birth weight through convergence across nutrition, health, and sanitation systems.",
        "working_process": "Frontline workers use digital tools for growth monitoring, households receive counselling, departments coordinate nutrition actions, and district dashboards track outcomes for mothers and children.",
    },
    {
        "name": "ASHA Programme",
        "category": "Health",
        "description": "The ASHA Programme deploys Accredited Social Health Activists as community health workers who connect households with essential healthcare and public health services.",
        "working_process": "ASHA workers conduct home visits, mobilize communities for immunization and maternal care, support referrals, and receive performance-linked incentives through the public health system.",
    },
    {
        "name": "PM Kaushal Vikas Yojana",
        "category": "Digital Skill",
        "description": "PM Kaushal Vikas Yojana provides short-term industry-relevant skill training and certification to improve employability among youth.",
        "working_process": "Training partners enrol candidates, deliver approved skill courses, conduct assessments through certifying bodies, and connect successful candidates with placement support.",
    },
    {
        "name": "Digital India Mission",
        "category": "Digital Skill",
        "description": "Digital India Mission promotes digital infrastructure, e-governance, and digital access so citizens can use online public services efficiently.",
        "working_process": "Government departments digitize services, states and agencies expand digital platforms, public access points support citizens, and usage grows through awareness and infrastructure expansion.",
    },
    {
        "name": "Skill India Mission",
        "category": "Digital Skill",
        "description": "Skill India Mission is a broad skilling initiative that aligns youth training, entrepreneurship, and workforce preparation with industry demand.",
        "working_process": "Sector skill councils define standards, training centres deliver programmes, assessments validate competency, and employment or self-employment pathways are supported after certification.",
    },
    {
        "name": "BharatNet Programme",
        "category": "Digital Skill",
        "description": "BharatNet Programme expands broadband connectivity to gram panchayats, enabling digital services, e-governance, and internet access in rural areas.",
        "working_process": "Optical fibre networks are planned and laid in phases, local institutions receive connectivity, service providers use the backbone, and rural users gain access to digital services.",
    },
    {
        "name": "PMGDISHA",
        "category": "Digital Skill",
        "description": "Pradhan Mantri Gramin Digital Saksharta Abhiyan trains rural households in basic digital literacy so they can use computers, smartphones, and online services confidently.",
        "working_process": "Eligible rural participants are registered at training centres, foundational digital modules are delivered, learners are assessed, and certified beneficiaries are encouraged to use digital services independently.",
    },
    {
        "name": "Digital Literacy Mission",
        "category": "Digital Skill",
        "description": "Digital Literacy Mission builds basic digital capability for citizens by teaching the use of devices, internet services, and digital transactions.",
        "working_process": "Local training partners identify beneficiaries, conduct digital literacy sessions, evaluate practical usage skills, and report outcomes through programme monitoring systems.",
    },
    {
        "name": "Jal Jeevan Mission",
        "category": "Infrastructure",
        "description": "Jal Jeevan Mission seeks to provide functional household tap connections and safe drinking water to rural households.",
        "working_process": "Village action plans are prepared, infrastructure for source strengthening and pipelines is built, household tap connections are installed, and water quality and service delivery are monitored locally.",
    },
    {
        "name": "PM Awas Yojana",
        "category": "Infrastructure",
        "description": "PM Awas Yojana supports affordable housing for eligible households in rural and urban areas with a focus on basic services and durable homes.",
        "working_process": "Beneficiaries are identified through approved lists, financial assistance is released in stages, construction is tracked, and completed houses are verified by local authorities.",
    },
    {
        "name": "Smart Cities Mission",
        "category": "Infrastructure",
        "description": "Smart Cities Mission improves urban infrastructure, service delivery, mobility, and technology-enabled governance in selected cities.",
        "working_process": "Cities prepare smart city proposals, special purpose vehicles manage implementation, projects are executed in phases, and service outcomes are monitored through urban dashboards.",
    },
    {
        "name": "AMRUT",
        "category": "Infrastructure",
        "description": "AMRUT improves urban basic services such as water supply, sewerage, green spaces, and non-motorized transport in cities and towns.",
        "working_process": "States and urban local bodies prepare improvement plans, projects receive approval and funding, implementation agencies execute works, and progress is reviewed against service benchmarks.",
    },
    {
        "name": "Pradhan Mantri Gram Sadak Yojana",
        "category": "Infrastructure",
        "description": "This road connectivity programme builds and upgrades all-weather rural roads to improve access to markets, schools, health services, and administration.",
        "working_process": "Eligible habitations are identified, roads are sanctioned under approved plans, contractors execute construction under quality checks, and maintenance responsibilities continue after completion.",
    },
]


def initialize_database() -> None:
    with sqlite3.connect(DB_PATH) as connection:
        cursor = connection.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                mobile TEXT NOT NULL UNIQUE,
                department TEXT NOT NULL,
                designation TEXT NOT NULL
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS schemes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                working_process TEXT NOT NULL
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS otp_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mobile TEXT NOT NULL,
                otp_code TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS district_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                district TEXT NOT NULL,
                author_name TEXT NOT NULL,
                comment TEXT NOT NULL,
                tag TEXT NOT NULL,
                action_item TEXT,
                created_at TEXT NOT NULL
            )
            """
        )

        cursor.executemany(
            """
            INSERT OR REPLACE INTO schemes (name, category, description, working_process)
            VALUES (:name, :category, :description, :working_process)
            """,
            SCHEME_SEED_DATA,
        )

        connection.commit()


if __name__ == "__main__":
    initialize_database()
    print(f"Database initialized at {DB_PATH}")
