#!/bin/bash

readonly content_type="Content-Type: application/json"
readonly base_url="http://localhost:11500"
readonly users_url="${base_url}/users"
readonly todo_list_url="${base_url}/todo-lists"
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

function execute_curl_cmd() {
    local _url="$1"
    local _method="$2"
    local _data="$3"

    if [ -z "${_data}" ]; then
        cmd="curl ${_url} -X ${_method} -H '${content_type}' -s"
    else
        cmd="curl ${_url} -X ${_method} -H '${content_type}' -d '${_data}' -s"
    fi
    echo ${cmd}
    echo $(eval ${cmd})
}

function add_users() {
    echo === add users ===
    {
        # usenamae birthday
        echo alice 2000/1/1
        echo ken 2000/1/2
        echo bob 2000/1/3
    } | while read username birthday; do
        data='{"username":"'${username}'","birthday": "'${birthday}'"}'
        execute_curl_cmd ${users_url} POST "${data}"
    done
    echo =================
}
function update_users() {
    echo === update users ===
    {
        echo 2 2001/1/2
        echo 3 2002/1/3
    } | while read user_id birthday; do
        data='{"birthday": "'${birthday}'"}'
        execute_curl_cmd ${users_url}/${user_id} PUT "${data}"
    done
    echo ====================
}

function add_todo() {
    echo === add todo lists ===
    {
        # title content
        echo finish homework@list: math, science, English@2222/2/2
        echo clean my room@at 10:00-11:00am@2222/2/2
        echo shopping@at 4:00-5:00pm@2222/2/2
    } | while IFS=@ read title content limit; do
        data='{"title":"'${title}'","content": "'${content}'","limit": "'${limit}'"}'
        execute_curl_cmd ${todo_list_url} POST "${data}"
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
        execute_curl_cmd ${todo_list_url}/${item_id} PUT "${data}"
    done
    echo =========================
}

# ====================
# === main routine ===
# ====================
# get all users
echo === get all users ===
execute_curl_cmd ${users_url} GET ""
echo =====================
# get all todo lists
echo === get all todo lists ===
execute_curl_cmd ${todo_list_url} GET ""
echo ==========================

# add data
add_users
add_todo

# get all users
echo === get all users ===
execute_curl_cmd ${users_url} GET ""
echo =====================
echo === get filtered users ===
execute_curl_cmd "${users_url}?username=alice" GET ""
echo ==========================
# get all todo lists
echo === get all todo lists ===
execute_curl_cmd ${todo_list_url} GET ""
echo ==========================

# update data
update_users
update_todo

# get all users
echo === get all users ===
execute_curl_cmd ${users_url} GET ""
echo =====================
# get all todo lists
echo === get all todo lists ===
execute_curl_cmd ${todo_list_url} GET ""
echo ==========================

# delete all data
function delete_all_data() {
    local _url="$1"

    echo === delete all data "(${_url})" ===
    curl ${_url} -X GET -H "${content_type}" -s | grep -oP '(?<="id":\s)\d+(?=,)' | while read target_id; do
        cmd="curl ${_url}/${target_id} -X DELETE -H '${content_type}' -D -"
        echo ${cmd}
        eval ${cmd}
    done
    echo =======================
}
function delete_all_data_using_query() {
    local _url="$1"

    echo === delete all data "(${_url})" ===
    cmd="curl '${_url}?title=_' -X DELETE -H '${content_type}' -D -"
    echo ${cmd}
    eval ${cmd}
    echo =======================
}

if [ ${delete_flag} -eq 1 ]; then
    delete_all_data ${users_url}
    delete_all_data_using_query ${todo_list_url}
fi

# get all users
echo === get all users ===
execute_curl_cmd ${users_url} GET ""
echo =====================
# get all todo lists
echo === get all todo lists ===
execute_curl_cmd ${todo_list_url} GET ""
echo ==========================
