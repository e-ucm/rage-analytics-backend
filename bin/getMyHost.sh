#!/bin/bash
grep $(uname -n) /etc/hosts | awk '{print $1, "\t"}'