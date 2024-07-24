<?php

// Turn on error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// LinkedIn App credentials
require('../config.php');
$redirectUri = 'https://job-ready-cvs.hellyer.kiwi/import.php';

if (!isset($_GET['code'])) {
    // Step 1: Get authorization URL and redirect user
    $authorizationUrl = 'https://www.linkedin.com/oauth/v2/authorization';

    $params = [
        'response_type' => 'code',
        'client_id' => $clientId,
        'redirect_uri' => $redirectUri,
        'scope' => 'openid profile email' //r_dma_portability_3rd_party
    ];
    $authorizationUrl .= '?' . http_build_query($params);
    file_put_contents('linkedin_debug.log', date('Y-m-d H:i:s') . ' $authorizationUrl: ' . $authorizationUrl . "\n", FILE_APPEND);
    header('Location: ' . $authorizationUrl);
    exit;
} elseif (isset($_GET['code'])) {
	file_put_contents('linkedin_debug.log', date('Y-m-d H:i:s') . " Request received\n" . print_r($_GET, true) . "\n\n", FILE_APPEND);

    // Step 2: Get an access token using the authorization code
    $tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    $params = [
        'grant_type' => 'authorization_code',
        'code' => $_GET['code'],
        'redirect_uri' => $redirectUri,
        'client_id' => $clientId,
        'client_secret' => $clientSecret
    ];
    file_put_contents('linkedin_debug.log', date('Y-m-d H:i:s') . ' $tokenUrl: ' . $tokenUrl . "\n", FILE_APPEND);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $tokenUrl);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        exit;
    }
    curl_close($ch);

    $tokenData = json_decode($response, true);
    file_put_contents('linkedin_debug.log', date('Y-m-d H:i:s') . ' $tokenData: ' . print_r($tokenData, true) . "\n", FILE_APPEND);
    if (isset($tokenData['access_token'])) {
        $accessToken = $tokenData['access_token'];

        // Step 3: Fetch user's profile data
        $profileUrl = 'https://api.linkedin.com/v2/me';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $profileUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        $profileResponse = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Curl error: ' . curl_error($ch);
            exit;
        }
        curl_close($ch);

        $userData = json_decode($profileResponse, true);

		file_put_contents('linkedin_debug.log', date('Y-m-d H:i:s') . "\nuserData JSON: " . print_r($userData, true) . "\n\n", FILE_APPEND);

        // Display CV data (e.g., user's profile)
        print_r($userData);
        /*
        echo 'Name: ' . $userData['localizedFirstName'] . ' ' . $userData['localizedLastName'];
        echo '<br>';
        echo 'Headline: ' . $userData['headline'];
        echo '<br>';
        echo 'Summary: ' . $userData['summary'];
        */
        // You can save $userData to your database or perform other operations
    } else {
        echo 'Error retrieving access token: ' . $response;
    }
} else {
    echo 'Error: Invalid state or authorization code missing.';
}


/*
Error retrieving access token: {
    "error": "invalid_request",
    "error_description": "Unable to retrieve access token: appid/redirect uri/code 
                          verifier does not match authorization code. Or authorization 
                          code expired. Or external member binding exists"
}
*/
