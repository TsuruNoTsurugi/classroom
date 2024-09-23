/*
 * Author: TsuruNoTsurugi
 * Date: 2024-09-23
 * License: MIT
 * GitHub Repository: TsuruNoTsurugi/classroom
 */

function getClasses() {
    var optionalArgs = {
        /* Maximum number of courses to get
         * Normally, the number of courses is less than 30,
         * however, deleted courses are also included in the response,
         * so please be very careful when new courses are created.
         */
        pageSize: 50
    };
    var response = Classroom.Courses.list(optionalArgs)['courses'];
    var classesList = [];
    for (var i = 0; i <= response.length - 1; i++) {
        if (response[i]['courseState'] != 'ACTIVE') {
            continue;
        }
        var childArr = { 'className': response[i]['name'], 'classId': response[i]['id'] };
        classesList.push(childArr);
    }
    return classesList;
}

function getClassPost(classId) {
    var posts = Classroom.Courses.Announcements.list(classId)['announcements'];
    return posts;
}

function getPostInfo(posts, num) {
    var postInfo = posts[num];
    return postInfo;
}

function send(arr) {
    for (var i = 0; i <= arr.length - 1; i++) {
        var target = arr[i];
        var className = target['className'];
        var content = target['text'];
        var postURL = target['alternateLink'];
        content += "\n\n**" + postURL + "**";
        /* var materials = target['materials']; */

        var time = target['creationTime'];
        var time = new Date(time).toLocaleString();
        var time = new Date(time);
        var timeHour = time.getHours();
        var timeHour = ('00' + timeHour).slice(-2);
        var timeMin = time.getMinutes();
        var timeMin = ('00' + timeMin).slice(-2);

        var userId = target['creatorUserId'];
        var creatorProfile = Classroom.UserProfiles.get(userId);
        var userName = creatorProfile.name.fullName;
        var Course_Name = target['courseName'];

        // ToDO: Insert your Discord Classroom webhook URL here
        var WEBHOOK_URL = '<Discord Classroom webhook URL>';
        const payload = {
            "content": "新規投稿がありました",
            "tts": false,
            "avatar_url": "https://developers.google.com/static/classroom/images/branding/classroom_72.png?hl=ja",
            "embeds": [
                {
                    "title": className,
                    "color": "21a464",  // Google Classroom Green
                    "fields": [
                        {
                            "name": `${Course_Name}/${userName} [${timeHour}:${timeMin}]`,
                            "value": content
                        }
                    ]
                }
            ]
        }
        UrlFetchApp.fetch(WEBHOOK_URL, {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify(payload),
        });
    }
}

function getIdsFromLink(alternateLink) {
    let ret = /\//;
    res = alternateLink.split(ret);
    return {
        "Course_Id": res[4],
        "Post_Id": res[6]
    }
}

function main() {

    var sendArr = [];
    var classes = getClasses();

    for (var i = 0; i <= classes.length - 1; i++) {
        var classId = classes[i]['classId'];
        var className = classes[i]['className'];
        var posts = getClassPost(classId);

        if (posts == undefined) {
            var maxPost = 0;
        } else if (posts.length >= 5) {
            var maxPost = 5;
        } else {
            var maxPost = posts.length;
        }

        if (maxPost != 0) {
            for (var n = 0; n <= maxPost - 1; n++) {
                var postInfo = getPostInfo(posts, n);
                postInfo['className'] = className;
                alternateLink_info = getIdsFromLink(postInfo.alternateLink);

                /*
                 * この先のコードは、別途ウェブサーバーを用意して、
                 * 逐一、投稿内容を登録していくためのものである。(README.md参照)
                 * もし、ウェブサーバーを用意していない場合は、以下のコードをコメントアウトすること。
                 * 
                 * その場合、Spreadsheetに投稿内容を記録することで、その機能を使うとよい。
                 */

                /* ToDO: Insert your API URL and API Key here */
                var API_URL = "<https://Your.Server/main.php>"
                var API_KEY = "<Your API KEY>";
                var options = {
                    'method': 'post',
                    'payload': {
                        'API_KEY': API_KEY,
                        'Course_Id': alternateLink_info['Course_Id'],
                        'Post_Id': alternateLink_info['Post_Id']
                    },
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
                var response = UrlFetchApp.fetch(API_URL, options);
                var json_data = JSON.parse(response)
                if (json_data['success'] == true && json_data['status'] == 200) {
                    sendArr.push(postInfo);
                }
                /*else{
                  Logger.log(["Course_Id: "+alternateLink_info['Course_Id'],"Post_Id: ",alternateLink_info['Post_Id'],response]);
                }*/
            }
        }
    }
    if (sendArr.length != 0) {
        send(sendArr);
    }
}