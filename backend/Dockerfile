##################################################
#                                                #
#  The base setup for dev and production images  #
#                                                #
##################################################

FROM node:20.9-bookworm-slim as base

# Create app directory
WORKDIR /app

# install config files for node
COPY package*.json ./

########## ########## ##########

##################################################
#                                                #
#           Development Live Server              #
#                                                #
##################################################
FROM base as development

# mount the source code, so changes are transparent and live
VOLUME ./src

# install npm modules for a development system
RUN npm install

# running on internal port 7000 (as default, set with PORT)
CMD ["npm", "start"]

########## ########## ##########

##################################################
#                                                #
#             Final Production Build             #
#                                                #
##################################################
FROM base as builder

# copy source files into the container so they are deployed
COPY ./src ./src

# install npm modules for a production system
RUN npm ci --omit=dev

# running on internal port 7000 (as default, set with PORT)
CMD ["npm", "start"]

########## ########## ##########
