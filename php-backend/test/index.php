<?php
//TODO Remove after testing!
//ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE);
//Until here

require_once("../db.php");
header('Content-Type: application/json; charset=utf-8');

function test() {
  try
  {
      $con = getPDO();
      $stmt  = $con->prepare("SELECT 1 + 1 AS TEST_QUERY");
      $stmt->execute();
      $dataRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
      
      echo(json_encode($dataRows));

      $conn = null;
  }
  catch (PDOException $exception)
  {
      error_log($exception->getMessage());
      return null;
  }
  return null;
}

test();
?>