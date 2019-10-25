#! /usr/bin/python2.7
# File: help.py

import functools

def help_(command_help):
    print("\nCommands:\n" + functools.reduce(build_help_block, command_help, ""))

def build_help_block(x, y):
    block = [
            x,
            "\n  ",
            y["calling"],
            functools.reduce(build_help_line, y["description"], ""),
            "\n",
            ]

    return "".join(block)

def build_help_line(x, y):
    return x + "\n  \t" + y
