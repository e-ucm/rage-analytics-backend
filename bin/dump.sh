#!/bin/bash

# Help menu for the script.
usage () {
	echo "Usage: `basename $0` [-h] [-b] [-d] [-r] [-i] [-s] [http://es-ESname:9200]"
	echo ""
	echo "where:   "
	echo "      -h   Show this help text "
	echo "      -b   Backup the elasticsearch indices to .json files "
	echo "      -r   Restore the indices back on the same ES using the .json files created."
	echo "      -s   Elasticsearch server name with port"
	echo ""

	info 
}

# What should be done before the script is executed.
info () {
	echo "*-*-*-*-*-*-*-*-*-*-*-*-*-* W A R N I N G *-*-*-*-*-*-*-*-*-*-*-*-*-*"
	echo ""
	echo -e "\\tPLEASE ENSURE NOTHING IS WRITING TO THIS Elasticsearch Cluster"
	echo ""
	echo -e "\\tThis script will dump all the indices from the elasticsearch ES into individual json files"
	echo ""
	echo -e "\\tYou should ALSO have a SNAPSHOT of ES as backup, if not done. ctrl+c and do that first"
	echo ""
	echo "*-*-*-*-*-*-*-*-*-*-*-*-*-* W A R N I N G *-*-*-*-*-*-*-*-*-*-*-*-*-*"
	echo ""
}

BACKUP=0
RESTORE=0
ES=""
while getopts ":hbdris:" option; do 
	case $option in 
		b) 
			BACKUP=1 ;;
		r)	
			RESTORE=1 ;;
		i)
			BACKUP=1
			DELETE=1
			RESTORE=1 ;;
		s)
			ES=$OPTARG ;;
		:) 
			usage
			exit 0
			;;
		h) # provide help
			usage
			exit 0
			;;
		\?)	#bla bla 
			usage
			exit 1 
			;;		
	esac
done

# Check if the ES name is provided
if [ "$ES" == "" ]; then
	usage
	exit 0
fi 

# print usage and info about the program 
usage 

echo ""
echo -ne "You have decided to  "
if [ $BACKUP == 1 ]; then
	echo -n " BACKUP "
fi	

if [ $RESTORE == 1 ]; then
	echo -n " RESTORE "
fi
echo -e " $ES\\r\\r"

echo "Document & Shard count on the ES "

# Get ES document count 
touch info 
echo $ES > info 
curl -s -XGET $ES/_count?pretty=true >> info
cat info

read -p "You can break the script now, or press any key to continue..."


# Backing up the elasticsearch indices to json files.
backup() {
	echo "*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* B A C K U P  *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*"

	echo "Capturing indices..."

	curl -s -XGET $ES/_cat/indices?h=i > indices

	echo "Using elasticdump to backup indices"
	
	read -p "You can modify the indices to reduce the subset of data being backed up and deleted, the script will not proceed till you hit any key"

	for INDEX in $(cat indices) 
	do 
		echo "Backing up " $INDEX 
		elasticdump --input=$ES/$INDEX --output=$INDEX.json 
		echo "-----------------" 
	done 

	echo "BACKUP COMPLETE!!"
}

# Recreate all the indices backed up as part of the backup process 
restore() {
	echo "*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* R E S T O R E  *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*"
	echo "REINDEXING..."
	
	FILES=*.json
	for f in $FILES
	do
	        echo "Processing $f ..."
	        elasticdump --bulk=true --input=$f --output=$ES
	done
	
}

if [ $BACKUP == 1 ]; then
	backup
fi	

if [ $RESTORE == 1 ]; then
	restore
fi	

echo "---- POST REINDEX ---- " >> info
curl -s -XGET $ES/_count?pretty=true >> info

cat info 

echo "All Done!"
