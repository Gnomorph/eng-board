#!/bin/env python3
import shutil, errno
import os
import re
import random
import string
import tarfile

path_fmt = "./{0}/{1}"

def build(args):
    src = args[0]
    filename = args[1]

    # Create a temp folder in ./dist
    dst_root = "dist/temp_{:s}/".format(makeRandomText())
    dst = "{:s}ui".format(dst_root)
    offline = "{:s}ui/offline".format(dst_root)

    try:
        os.mkdir(dst_root)
        shutil.copytree(src, dst)
        shutil.copytree(src, offline)
    except:
        print("\nThere was an issue copying to the temp folder\n")
        raise

    try:
        # try to create a new tar file
        try:
            create_tar = tarfile.open(filename + '.tar.gz', mode='x:gz')
            create_tar.close()
        except:
            raise

        # Tar up the temp folder
        try:
            with tarfile.open(filename + '.tar.gz', mode='w:gz') as out:
                #print("changing to folder: {:s}".format(dst))
                os.chdir(dst_root)
                out.add("ui")
        except Exception as ex:
            print("trouble creating the zip file. check if it already exists")
            print(ex.message)
        finally:
            os.chdir("../../")

        # remove the temp folder
    finally:
        print (os.getcwd())
        print ("remove temp file: " + dst_root)
        shutil.rmtree(dst_root)

randOpts = string.ascii_letters + string.digits
def makeRandomText():
    return "".join( [random.choice(randOpts) for i in range(8)] )

def help_text():
    return {
            "calling": "frontend build [src] [dst] [index file]",
            "description": [
                "this will start the build process.",
                "so far this strips tags out of the index file and replaces ",
                "them with a single file located in './scripts/'.",
                ]
            }
