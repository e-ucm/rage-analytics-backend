FROM java

# used to download sources, executables
RUN apt-get update \
  && apt-get install -y gcc g++ make

# NodeJS installation, gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 4.2.1

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --verify SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
  && tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc

CMD [ "node" ]

ENV USER_NAME="user" \
    WORK_DIR="/app"

# setup sources, user, group and workdir
COPY ./ ${WORK_DIR}/
RUN groupadd -r ${USER_NAME} \
    && useradd -r -d ${WORK_DIR} -g ${USER_NAME} ${USER_NAME} \
    && chown -R ${USER_NAME}:${USER_NAME} ${WORK_DIR}
ENV HOME=${WORK_DIR}
USER ${USER_NAME}
WORKDIR ${WORK_DIR}

# get dependencies sorted out
RUN npm install

# configure & gen apidoc
RUN npm run fast-setup \
    && npm run gen-apidoc

# expose & run
EXPOSE 3300
CMD [ "npm", "run", "docker-start" ]

# EXPECTS: a2 at 3000, kafka at 2181, openlrs at 8080