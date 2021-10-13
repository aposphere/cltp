<?php
// Create the server connection
function getPDO($server = "DB", $port = 1433, $db = "db", $username = "user", $password = "password")
{
  $con = new PDO("sqlsrv:Server=" . $server . ", " . $port . ";Database=" . $db, $username, $password);
  $con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $con->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,PDO::FETCH_ASSOC);
  return $con;
}
?>
