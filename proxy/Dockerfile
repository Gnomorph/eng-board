##################################################
#                                                #
#           nginx reverse proxy build            #
#                                                #
##################################################
FROM nginx:1.25-bookworm

# install the nginx site config file
COPY ./proxy.conf /etc/nginx/conf.d/default.conf

# set the working directory to the nginx site root
WORKDIR /usr/share/nginx/html

# remove all default nginx files
RUN rm -rf ./*

# serving content on internal port 80

# start nginx and serve content
CMD ["nginx", "-g", "daemon off;"]
