<?php
session_set_cookie_params(0);
session_start();

// == [ AJAX check ] == //
if(empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {

  header("Location: ../index.php");
  die();
  
}


// ======================================== //
// ============[ PATHS & VARS ]============ //
// ======================================== //

$base_url = dirname(__FILE__);
$parent_url = dirname($base_url);
require_once($parent_url.'/inc/lib/inc.lib.auction.php');
$AIF = new Lib_Auction;
$id = '';

if(empty($_SESSION['AIF_token'])):
$_SESSION['AIF_token_time'] = "";
$_SESSION['AIF_customerID'] = "";
$_SESSION['AIF_username'] = "";
$_SESSION['AIF_token'] = "";
endif;


// ======================================== //
// ============[ INPUT FILTERS ]=========== //
// ======================================== //

function _INPUT($value) // filter all input
{
	$value = strip_tags($value);
	$value = preg_replace('/[^(\x20-\x7F)\x0A]*/','', $value);
	$value = str_replace(array("!", "#", "$", "%", "^", "&", "*", "<", ">", "?", ',' , "'"), '', $value);
	$value = str_replace(array("\r\n", "\r", "\n", "\t", " "), '', $value);
	
	return $value;
}

$_GET = array_map('_INPUT', $_GET); // filter all input



  if (!empty($_SERVER['HTTP_CLIENT_IP']))
  {
	$ip=$_SERVER['HTTP_CLIENT_IP'];
  }
  elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
  {
	$ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
  }
  else
  {
	$ip=$_SERVER['REMOTE_ADDR'];
  }	


// ======================================== //
// ============[ INPUT FILTERS ]=========== //
// ======================================== //


// ====================================== //
// ============[ ACTION MENU ]=========== //
// ====================================== //


if(isset($_GET['action']) && !empty($_GET['action']) && is_string($_GET['action'])):

$action = $_GET['action'];

	switch($action):

		case 'AIFlogin':
		
		  $user = $AIF->AIF_login($_GET['username'], $_GET['password'], $ip);
 
		  $_SESSION['AIF_token_time'] = date("Y/m/d H:i:s");
		  $_SESSION['AIF_customerID'] = $user['customerID'];
		  $_SESSION['AIF_username'] = $user['aif_user_name'];
		  //$_SESSION['AIF_user_token'] = $user['aif_user_token'];
		  $_SESSION['AIF_token'] = $user['aif_user_token'];

		  if($user == false):
			$auction[$id] = array('error' => '1');
			  session_unset();
			  session_destroy();
		  else:
		  	$stats = $AIF->calcStats($user['aif_user_name'], $user['customerID']);
			
			$houseCleaning = $AIF->houseCleaning(); // we use login rather than cron to trigger house cleaning events
			
			$auction[$id] = array('username' => $user['aif_user_name'], 'customerID' => $user['customerID'], 'error' => '0', 'sessionID'=>$ip);
		  endif;
		  
		  echo json_encode($auction[$id]);

		  break;


		case 'getTime':

          $now = new DateTime(); 
		  echo $now->format("M j, Y H:i:s O")."\n";
		  
		  break;
		  

		case 'syncPrice':

          $a = $AIF->updateCountdownPrice($_GET['auctionID']);
		  $auction[$id] = array('sync' => 'price');
		  echo json_encode($auction[$id]);

		  break;


		case 'syncTime':
		  
		  if($_GET['xtnd'] == '1'):
		   $a = $AIF->extendAuctionTime($_GET['auctionID']);
		   $e = explode(' ',$a);
		   $auction[$id] = array('time' => $e[1],'date' => $e[0],'sync'=>'dateTime');
		   echo json_encode($auction[$id]);
		   //echo $a;
		  endif;
		  
		  if($_GET['xtnd'] == '0'):
           $b = $AIF->searchAuction($_GET['auctionID'],'1');
		   $e = explode(' ',$b['aif_auction_end']);
		   $auction[$id] = array('time' => $e[1],'date' => $e[0],'sync'=>'dateTime');
		   echo json_encode($auction[$id]);			
		  endif;		  

		  break;		  
		  

		case 'getEndTime':

          $a = $AIF->searchAuction($_GET['auctionID'],'1');
		  $e = explode(' ',$a['aif_auction_end']);
          $auction[$id] = array('time' => $e[1],'date' => $e[0]);
		  echo json_encode($auction[$id]);		  
		  break;		  
		  
		  
		case 'getAuction':

          $ga = $AIF->getAuction($_GET['aifID']);
		  
		  if($ga['status'] == 'end'):
		  
		    $auction[$id] = array('auctionID' => $ga['auctionID'] );
			$ga = $AIF->AIF_Terminate();
		    
		  else:
		    $auction[$id] = array('auctionID' => $ga['auctionID'] );
		  endif;

		  echo json_encode($auction[$id]);
		  
		  break;
		  
		
		case 'getAuctionDetails':
		
		  $aa = $AIF->getAuctionDetails($_GET['auctionID']);

		  $auction[$id] = array('time'=>$aa['time'],'price'=>$aa['price'],'title'=>$aa['title'],'sub_title'=>$aa['sub_title'],'desc'=>$aa['desc'],'retail'=>$aa['retail'],'img'=>$aa['img'],'url'=>$aa['url'],'ven'=>$aa['ven'],'ven_det'=>$aa['ven_det']);
		  
		  echo json_encode($auction[$id]);		  

		  break;
		  
		
		case 'bidPrice':
		  if($_SESSION['AIF_token']):
		    $token = '1';
		  else:
		    $token = '0';
		  endif;
		   $bp = $AIF->bidPrice($_GET['auctionID']);
		   $auction[$id] = array('price' => $bp['price'], 'username' => $bp['user'], 'token' => $token);
		   echo json_encode($auction[$id]);

		  break; 
		  
		
		case 'updatePrice':
		
		  if($_SESSION['AIF_token']):	
			
			$price = $AIF->updateCurrentPrice($_GET['auctionID'],$_SESSION['AIF_customerID']);
			$auction[$id] = array('price' => $price, 'token' => '1');
		  
		  	$AIF->bidLog($_GET['auctionID'],$ip,$_SESSION['AIF_customerID'],$price);
		  
		  else:
			$auction[$id] = array('token' => '0');		  
		  endif; 

			echo json_encode($auction[$id]);
		  
		  break;


		case 'getUser':

		  if($_SESSION['AIF_token'] && $_SESSION['AIF_customerID']):
		  
		  $auction[$id] = array('username' => $_SESSION['AIF_username'], 'customerID' => $_SESSION['AIF_customerID'], 'error'=>'0');
		  
		  else:
		  
		  $auction[$id] = array('error'=>'1');
		  session_unset();
		  session_destroy();
		  endif;

		  echo json_encode($auction[$id]);

		  break;
		  
		  
		case 'myAccount':

		  if($_SESSION['AIF_token'] && $_SESSION['AIF_customerID']):
				
			$gp = $AIF->myAccount($_SESSION['AIF_customerID']);
			$auction[$id] = array('username' => $_SESSION['AIF_username'], 'tokens' => $gp['tokens'], 'wins' => $gp['wins'], 'payup' => $gp['payup'], 'account'=>'1');
	
			echo json_encode($auction[$id]);		  
		  endif;

		  break;		  
		  
		  
		case 'bidderProfile':
		  
		  $cp = $AIF->getBidderProfile($_GET['bidder']);
		  $bp = $AIF->getBidderStats($cp['customerID']);
	  
		  $auction[$id] = array('cid'=>$cp['customerID'],'ta'=>$bp['aif_stats_TotalAuctions'],'ab'=>$bp['aif_stats_AveBids'],'tw'=>$bp['aif_stats_TotalWin'],'aw'=>$bp['aif_stats_AveWin'],'awp'=>$bp['aif_stats_AveWinPrice'],'abt'=>$bp['aif_stats_AveBidTime'],'alb'=>$bp['aif_stats_AveLastBid']);
		  echo json_encode($auction[$id]);
		  
		  break;		  
		  
		  
		case 'getWinner':

		  $w = $AIF->getWinner($_GET['auctionID']);
		  $auction[$id] = array('final_price' => $w['final_price'],'username' => $w['username']);
		  echo json_encode($auction[$id]);

		  break;



		case 'endAuction':

          $end = $AIF->endAuction($_GET['auctionID']);
		  
		  if($end == 'end'):
			
			$w = $AIF->getWinner($_GET['auctionID']);
			
			// are you winner?
			if($w['win_cust_id'] == $_GET['customerID'] && $w['win_cust_id'] == $_SESSION['AIF_customerID']):
			  $win = '1';
			else:
			  $win = '0';
			endif;
			
			// add winner to bid log
			$bidLog = $AIF->bidLogWin($_GET['auctionID'], $ip, $w['win_cust_id'], $w['final_price']);
			
			// add non winner to swoop log if is swoop auction
			$swoop = $AIF->swoop($_GET['auctionID'],$w['win_cust_id']);
			
			// get next auction
			$auctionID = $AIF->getAuction($_GET['aifID']);

			$auction[$id] = array('end' => $w['end'],'final_price' => $w['final_price'],'username' => $w['username'], 'auctionID' => $auctionID['auctionID'],'win'=>$win);
			
			echo json_encode($auction[$id]);
		  
		  endif;

		  break;
		  

		case 'logout':
		
		  $AIF->logOut();

		  break;
		  
		  
		case 'test':
			/*
			$test = $AIF->searchAuction(NULL,'3');
			while($t = $test->fetch_array(MYSQL_ASSOC)):
			
			  print_r($t);
			
			endwhile;
			*/
			
			print_r($AIF->getAuction('d4985969a109678c57203e7df55eed47'));


		  break;		  
	

	endswitch;

endif;

// ====================================== //
// ============[ ACTION MENU ]=========== //
// ====================================== //

?>