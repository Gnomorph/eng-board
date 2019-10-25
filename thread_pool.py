#! /usr/bin/python2.7
# File: thread_pool.py

import sys, traceback

from queue import Queue
from threading import Thread

import boto3

global clean
clean = True

class Worker(Thread):
    """Thread executing tasks from a given tasks queue"""
    def __init__(self, tasks):
        Thread.__init__(self)
        self.tasks = tasks
        self.daemon = True
        self.start()
        self.session = boto3.session.Session()
        self.client = self.session.client('s3')

    def run(self):
        global clean

        while True:
            func, args = self.tasks.get()

            if clean == True:
                try:
                    func(self.client, *args)
                except Exception as e:
                    clean = False
                    print ("*** ERROR ***")
                    print (args[2])
                    traceback.print_exc()
                    print ("*************\n\n")
                    self.tasks.task_done()
                    break

            self.tasks.task_done()

class ThreadPool:
    """Pool of threads consuming tasks from a queue"""
    def __init__(self, num_threads):
        self.tasks = Queue(num_threads)
        for _ in range(num_threads): Worker(self.tasks)

    def add_task(self, func, args):
        """Add a task to the queue"""
        self.tasks.put((func, args))

    def wait_completion(self):
        """Wait for completion of all the tasks in the queue"""
        self.tasks.join()

def printHelp():
    print("You cannot use ThreadPool by itself. Please import this as a module.")

if __name__ == "__main__":
    printHelp();
