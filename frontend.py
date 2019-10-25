#! /usr/bin/python3
# File: frontend.py

import sys
import os

from help import help_
import start
import push
import build
from dev_utils import dev_utils as utils

##
#  Command Line Entrance Point
##

def Frontend(args):
    args = [None] if len(args)==0 else args

    func = commands.get(args[0], commands["help"])
    func(args[1:])

def deploy(args):
    name = "wb.paytonsepic.com"
    host = "aws-PairPlay"
    dst = "app"
    archive = "{}.tar.gz".format(name)
    build.build([dst, name])
    utils.runCommand(["scp", archive, "{}:./".format(host)])
    os.remove(archive)
    utils.runCommand(["ssh", host, "/home/admin/deploy-static.sh {}".format(name)])

commands = {
        "help": lambda x: help_(command_help),
        "start": start.start,
        "deploy": deploy,
        "push": push.push,
        "build": build.build,
        }

command_help = [
        start.help_text(),
        push.help_text(),
        build.help_text(),
        ]

if __name__ == "__main__":
    sys.exit(Frontend(sys.argv[1:]))
