import os

import dev_utils as utils

def start(args):
    environment = srv_env.get(None if len(args)==0 else args[0], "development")

    if environment == "development":
        os.chdir("./app")
    elif environment == "production":
        os.chdir("./dist")
    else:
        print ("Unexpected Error")
        return

    utils.runCommand(['node', '../node_modules/live-server/live-server.js'])

def help_text():
    return {
            "calling": "frontend start [environment]",
            "description": [
                "this will start the frontend server",
                "the default environment is 'development'",
                ],
            }

srv_env = {
        "dev": "development",
        "development": "development",
        "prod": "production",
        "production": "production",
        "mindevelopment": "mindevelopment",
        }
