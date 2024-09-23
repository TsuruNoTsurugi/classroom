<?php

/* 
 * Author: TsuruNoTsurugi
 * Date: 2024-09-23
 * License: MIT
 * GitHub Repository: TsuruNoTsurugi/classroom
 * 
 * Description of the API
 * This API is used to insert a new record into the classroom table,
 * and respond with a JSON object that contains the course id and post id of the inserted record.
 * 
 * The API requires the following parameters (fill in the parameters in the code with ToDO: comments):
 *      1. API_KEY: A string that is used to authenticate the user.
 *      2. Course_Id: A string that represents the course id.
 *      3. Post_Id: A string that represents the post id.
 *      4. <mysql host>, <mysql databasename>, <mysql username>, <mysql password>: Your MySQL database information.
 *          * If you use `.user.ini` which set up the environment variables of MySQL, you can remove these parameters.
 * The API returns a JSON response with the following fields:
 *      1. success: A boolean that indicates if the operation was successful.
 *      2. message: A string that provides additional information about the operation.
 *      3. status: An integer that represents the HTTP status code.
 *          * 200: The record was inserted successfully.
 *          * 201: The record already exists and was updated.
 *          * 400: The request was invalid.
 *          * 401: The API key was invalid.
 *      4. result: An object that contains the course id and post id of the inserted record.
 */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Method is POST

    /* ToDO: Add your MySQL database information here */
    $pdo = new PDO('mysql:host=<mysql host>;dbname=<mysql databasename>;charset=utf8', 
                    '<mysql username>', 
                    '<mysql password>');

    $API_KEY = $_POST['API_KEY'];
    /* ToDO: Add your API key here */
    if ($API_KEY !== '<API KEY>'){
        $response = array(
            'success' => false,
            'message' => 'Invalid API key.',
            'status' => 401
        );
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }
    $Course_id = $_POST['Course_Id'];
    $Post_id = $_POST['Post_Id'];

    /* ToDO: Add your MySQL database information here */
    $query = "SELECT Post_id, updated FROM <mysql databasename>.classroom WHERE Course_id = :Course_id AND Post_id = :Post_id";
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':Post_id', $Post_id, PDO::PARAM_STR);
    $stmt->bindValue(':Course_id', $Course_id, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result == null) {
        /* ToDO: Add your MySQL database information here */
        $query = "INSERT INTO <mysql databasename>.classroom (Course_id, Post_id) VALUES (:Course_id, :Post_id)";
        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':Course_id', $Course_id, PDO::PARAM_STR);
        $stmt->bindValue(':Post_id', $Post_id, PDO::PARAM_STR);
        $stmt->execute();

        $response = array(
            'success' => true,
            'message' => 'Inserted new record.',
            'status' => 200,
            'result' => (object) array(
                'Course_id' => $Course_id,
                'Post_id' => $Post_id
            )
        );
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    } else {
        $message = 'This record already exists.';
        $result['updated'] = date('Y-m-d H:i:s');
        if (strtotime($result['updated']) < strtotime('-1 day')) {
            /* ToDO: Add your MySQL database information here */
            $query = "DELETE FROM <mysql databasename>.classroom WHERE Post_id = :Post_id AND Course_id = :Course_id";
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':Post_id', $Post_id, PDO::PARAM_STR);
            $stmt->bindValue(':Course_id', $Course_id, PDO::PARAM_STR);
            $stmt->execute();
            $message .= ' Deleted old record.';
        }

        $response = array(
            'success' => true,
            'message' => $message,
            'status' => 201,
        );
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }
} else {
    // Method is not POST
    $response = array(
        'success' => false,
        'message' => 'Invalid request.',
        'status' => 400
    );

    header('Content-Type: application/json');
    echo json_encode($response);
}