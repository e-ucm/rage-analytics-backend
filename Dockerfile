FROM node

ENV REPO_URL="https://github.com/e-ucm/rage-analytics-backend" \
    REPO_TAG="master" \
    USER_NAME="user" \
    WORK_DIR="/app"

# setup user, group and workdir
RUN groupadd -r ${USER_NAME} \
    && useradd -r -d ${WORK_DIR} -g ${USER_NAME} ${USER_NAME} \
    && mkdir ${WORK_DIR} \
    && chown ${USER_NAME}:${USER_NAME} ${WORK_DIR}
USER ${USER_NAME}
ENV HOME=${WORK_DIR}
WORKDIR ${WORK_DIR}

# retrieve sources
RUN git clone -b "$REPO_TAG" --single-branch "$REPO_URL" .

# get dependencies sorted out
RUN npm install

# configure & gen apidoc
RUN npm run fast-setup \
    && npm run gen-apidoc

# expose & run
EXPOSE 3300
CMD [ "npm", "run", "docker-start" ]

# EXPECTS: a2 at 3000, kafka at 2181, openlrs at 8080
# FIXME: cannot launch storm topologies yet
