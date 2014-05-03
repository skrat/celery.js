FROM base/archlinux
MAINTAINER Dusan <dusan@floorplanner.com>

# Runs whole system upgrade and install packages
RUN pacman -Syu --noconfirm
RUN pacman -S --noconfirm base-devel nodejs python2-pip

# Installs etcd client module
RUN pip2 install python-etcd==0.3.0
RUN pip2 install urllib3==1.8.2

# Installs celery to socket.io gateway
RUN npm install -g celerygw

# Add service discovery
ADD configure.py /configure.py
RUN chmod 755 /configure.py

# Add run script
ADD run.sh /run.sh
RUN chmod 755 /run.sh

EXPOSE 8080

CMD /run.sh

