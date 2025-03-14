# Area Project

**An automation platform that interconnects various services to trigger actions based on predefined conditions.**

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [Technologies Used](#technologies-used)
- [License](#license)
- [Contact](#contact)
    - [Team Members](#team-members)
- [Acknowledgments](#acknowledgments)

## About the Project

The Area Project is designed to provide a platform similar to IFTTT or Zapier, enabling users to automate tasks by connecting different web services.  It allows users to link Actions from one service to REActions in another, creating automated sequences.

The project focuses on integrating existing libraries and services rather than reinventing the wheel.  The core challenge lies in orchestrating these components effectively to deliver a functional automation platform.    

The application is divided into three parts:
- Application servers to handle the business logic and API endpoints.    
- A web client to provide a user interface for managing and configuring automations.    
- A mobile client to allow users to interact with the application from their mobile devices.    

## Features

* **User Management:** Registration, and account confirmation.
   
* **Service Integration:** Connecting various services like Google, X, and others via OAuth2.
   
* **AREA Creation:** Linking Actions and REActions to create automated tasks.
   
* **Triggers:** System to initiate REActions based on the occurrence of linked Actions.

## Getting Started

Follow these instructions to get a copy of the project on your local machine.

### Prerequisites

- Docker

### Installation

1. Clone the repository:
     ```bash
     git clone https://github.com/ItsZcx/area.git
     ```
2. Navigate to the project directory:
     ```bash
     cd area
     ```
3. Set up environment variables:
     ```bash
     cp .env.example .env
     ```
4. Start the services using Docker Compose:
     ```bash
     docker compose up -d
     ```
## Technologies Used

**General:**
- **Docker:** Containerization platform to run the application services.

**Backend:**
- **FastAPI:** For building the backend APIs.
- **Poetry:** For dependency management in Python.
- **SQLAlchemy:** ORM for database interactions.
- **Alembic:** Database migrations.

**Frontend:**
- **Next.js:** React framework for building the web frontend.
- **Tailwind CSS:** Utility-first CSS framework for styling.

**Mobile:**
- **React Native:** For the mobile frontend.
- **Expo:** Framework and platform for universal React applications.
- **Android SDK:** For building Android applications.

**Database:**
- **PostgreSQL:** Relational database management system.

**Others:**
- **OAuth2:** For authentication and authorization.
- **Pydantic:** For data validation and settings management.
- **Dotenv:** For managing environment variables.
- **Ngrok:** For tunneling local servers to the internet.

## License

This project is licensed under the **MIT** License - see the [LICENSE](./LICENSE) file for details.

## Contact

### Team Members

- **Joan Pau Mérida Ruiz**: *Backend Developer, Infra Manager* ([GitHub](https://github.com/itszcx), [LinkedIn](https://www.linkedin.com/in/joan-pau-merida-ruiz), [Email](mailto:joanpaumeridaruiz@gmail.com))
- **Alex Arteaga Contijoch**: *Backend Developer* ([GitHub](https://github.com/alex-alra-arteaga), [LinkedIn](https://www.linkedin.com/in/alex-arteaga-c/), [Email](mailto:alex.arteaga-contijoch@epitech.eu))
- **David Salvatella Gelpi**: *Fullstack Developer* ([GitHub](https://github.com/xRozzo), [LinkedIn](https://www.linkedin.com/in/david-salvatella/), [Email](mailto:david.salvatella-gelpi@epitech.eu))
- **Joel Revuelta Gomez**: *Frontend Developer* ([GitHub](https://github.com/Joel-Revuelta), [LinkedIn](https://www.linkedin.com/in/joel-revuelta/), [Email](mailto:joel.revuelta-gomez@epitech.eu))
- **Pol Rodriguez Garcia**: *Mobile Developer* ([GitHub](https://github.com/polroga31), [LinkedIn](https://www.linkedin.com/in/pol-rodriguez-garcia/), [Email](mailto:pol.rodriguez-garcia@epitech.eu))

## Acknowledgments

- This project was inspired by IFTTT and Zapier.    
