import sys
import traceback
import mimetypes
import time
import os
import subprocess

import dev_utils as utils

from help import help_

def push(args):
    if len(args) == 0:
        help_([help_text()])
        return

    env = args[0].lower()
    #os.chdir("./app")

    region, bucket, environment = get_envs().get(env, (None, None, None))
    if (not (region and bucket and environment)):
        help_([help_text()])
        return

    if (not copy_credentials(environment)):
        print ("there was an error copying the aws config file")
        return

    upload_all("dist", region, bucket);

def upload_all(folder, region, bucket):
    try:
        # 1) Init a Thread pool with the desired number of threads
        pool = ThreadPool(20)

        #try:
        for entry in os.walk(folder):
            for filename in entry[2]:
                try:
                    # 2) Add the task to the queue
                    pool.add_task(myUploadFile, [bucket, entry, filename, region])
                except:
                    print ("there was an error uploading {:s}".format(filename))
                    print (traceback.print_exc())

        # 3) Wait for completion
        pool.wait_completion()
    finally:
        cleanCmd = [
                'cp',
                os.getenv("HOME") + '/.aws/config.development',
                os.getenv("HOME") + '/.aws/config']
        utils.runCommand(cleanCmd)
        print ("\nAll Done")

def myUploadFile(client, bucket, entry, filename, region):
    path = entry[0] + '/' + filename
    key = path[5:]
    extension = os.path.splitext(filename)[1]
    file_contenttype = mimetypes.guess_type(filename)[0]

    options = {}
    options['CacheControl'] = 'max-age=1200'
    options['Metadata'] = {"Surrogate-Control": 'max-age=31540000'}
    if not file_contenttype == None:
        options['ContentType'] = file_contenttype

    #if key not in uploaded:
    start_time = time.time()
    client.upload_file(path, bucket, key, options)
    sys.stdout.write('.')
    sys.stdout.flush()
    #print ("path: {0}\n\tbucket: {1}\n\tkey: {2}\n\toptions: {3}".format(path, bucket, key, options))
    #end_time = time.time()

    #uploaded.add(key)

    #period = end_time - start_time
    #size = os.path.getsize(path)
    #kb_size = os.path.getsize(path)/1000
    #speed = size/period/1000
    #print ("{:0.1f} kB in {:0.3f}s [{:0.1f} kbps] \t{}".format(kb_size, period, speed, key))

def get_envs():
    dev = ('us-west-2', 'pe.indieraydev.com', 'development')
    prod = ('us-west-2', 'www.paytonsepic.com', 'production')
    return {
            'dev': dev,
            'development': dev,
            'prod': prod,
            'production': prod,
            }

def copy_credentials(environment):
    copyCmd = [
            'cp',
            os.getenv("HOME") + '/.aws/config.{0}'.format(environment),
            os.getenv("HOME") + '/.aws/config'
            ]
    return utils.runCommand(copyCmd)

def help_text():
    return {
            "calling": "frontend push environment",
            "description": [
                "this will push the frontend code to the specified environment (dev, prod)",
                ],
            }
