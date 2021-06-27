#!/bin/bash

readonly content_type="Content-Type: application/json"
readonly base_url="http://localhost:11500"
readonly user_profile_url="${base_url}/user-profile"
readonly todo_list_url="${base_url}/todo-list"
delete_flag=0

# check arguments
while [ -n "$1" ]; do
    case "$1" in
        -d | --delete )
            delete_flag=1
            shift
            ;;
        * )
            shift
            ;;
    esac
done

function add_user_profile() {
    echo === add user profiles ===
    {
        # usenamae birthday
        echo alice 2000/1/1
        echo ken 2000/1/2
        echo bob 2000/1/3
    } | while read username birthday; do
        data='{"username":"'${username}'","birthday": "'${birthday}'"}'
        echo $(curl ${user_profile_url} -X POST -H "${content_type}" -d "${data}" -s)
    done
    echo =========================
}
function update_user_profile() {
    echo === update user profiles ===
    {
        echo 2 2001/1/2
        echo 3 2002/1/3
    } | while read user_id birthday; do
        data='{"birthday": "'${birthday}'"}'
        echo $(curl ${user_profile_url}/${user_id} -X PUT -H "${content_type}" -d "${data}" -s)
    done
    echo ============================
}

function add_todo() {
    echo === add todo lists ===
    {
        # title content
        echo finish homework@list: math, science, English
        echo clean my room@at 10:00-11:00am
        echo shopping@at 4:00-5:00pm
    } | while IFS=@ read title content; do
        data='{"title":"'${title}'","content": "'${content}'"}'
        echo $(curl ${todo_list_url} -X POST -H "${content_type}" -d "${data}" -s)
    done
    echo ======================
}
function update_todo() {
    echo === update todo lists ===
    {
        # title content
        echo 1@list: math, science, English, Japanese
        echo 3@at 7:00-8:00pm
    } | while IFS=@ read item_id content; do
        data='{"content": "'${content}'"}'
        echo $(curl ${todo_list_url}/${item_id} -X PUT -H "${content_type}" -d "${data}" -s)
    done
    echo =========================
}

# ====================
# === main routine ===
# ====================
# get all user profiles
echo === get all user profiles ===
echo $(curl ${user_profile_url} -X GET -H "${content_type}" -s)
echo =============================
# get all todo lists
echo === get all todo lists ===
echo $(curl ${todo_list_url} -X GET -H "${content_type}" -s)
echo ==========================

# add data
add_user_profile
add_todo

# get all user profiles
echo === get all user profiles ===
echo $(curl ${user_profile_url} -X GET -H "${content_type}" -s)
echo =============================
echo === get filtered user profiles ===
echo $(curl "${user_profile_url}?username=alice" -X GET -H "${content_type}" -s)
echo =============================
# get all todo lists
echo === get all todo lists ===
echo $(curl ${todo_list_url} -X GET -H "${content_type}" -s)
echo ==========================

# update data
update_user_profile
update_todo

# get all user profiles
echo === get all user profiles ===
echo $(curl ${user_profile_url} -X GET -H "${content_type}" -s)
echo =============================
# get all todo lists
echo === get all todo lists ===
echo $(curl ${todo_list_url} -X GET -H "${content_type}" -s)
echo ==========================

# delete all data
function delete_all_data() {
    local _url="$1"

    echo === delete all data "(${_url})" ===
    curl ${_url} -X GET -H "${content_type}" -s | grep -o -E '"id":([0-9]*),' | sed -E -e 's|"id":([0-9]*),|\1|' | while read target_id; do
        curl ${_url}/${target_id} -X DELETE -H "${content_type}" -D - -s
    done
    echo =======================
}


if [ ${delete_flag} -eq 1 ]; then
    delete_all_data ${user_profile_url}
    delete_all_data ${todo_list_url}
fi
