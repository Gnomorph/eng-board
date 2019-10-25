#! /usr/bin/python2.7
# File: dev_utils.py

import sys
import time

import subprocess

def runCommands(commandList):
    for command in commandList:
        runCommand(command)

def runCommand(command):
    p = subprocess.Popen(command)
    retcode = p.poll()

    while retcode is None:
        time.sleep(1)
        retcode = p.poll()

    if retcode == 0:
        return True
    else:
        return False

def stopProcess(process):
    try:
        output = subprocess.check_output(["pidof", process])

        command = ["sudo", "kill"]
        for pid in output.strip("\n").split(" "):
            command.append(pid)

        subprocess.check_output(command)
    except:
        print("no process by that name")

def printHelp():
    print("this is just a module")

if __name__ == "__main__":
    sys.exit(printHelp())
