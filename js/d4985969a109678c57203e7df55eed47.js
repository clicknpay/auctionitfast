// JavaScript Document
function AuctionTimer(auctionID)
{
	this.auctionID = auctionID;
	var ct = new Date();
	this.y = ct.getFullYear();
	this.m = ct.getMonth();
	this.d = ct.getDate();
	this.name = "timer";
}

AuctionTimer.prototype.initTime = function()
{
	
	this.auctionDetails('getAuctionDetails');
	this.update_user('getUser');
	this.tick();
	
	bid = setInterval(this.name + '.update_price()', 1500);
	//sync = setInterval(this.name + '.extendTimer(\'syncTime\',\'0\')', 5000);
		
}

// ================================ //
// ===== [ AUCTION DETAILS ] ====== //
// ================================ //

AuctionTimer.prototype.auctionDetails = function(action)
{
	
	$.ajax({
	type: 'GET',
	cache: false,
	url: 'inc/inc.auction.php',
	data: {'action' : action, 'auctionID':this.auctionID},
	success: function(auction_data)
	{
	   var json = $.parseJSON(auction_data);
	   
	   if(json.title != undefined)
		{
			$("#AIF_price").html("$"+json.price);
			$("#AIF_title").html(json.title);
			$("#AIF_sub_title").html(json.sub_title);
			$("#AIF_retail").html('Retails for: $'+json.retail);
			$("#AIF_retailer").html('Featured Retailer - '+json.ven);
			$("#AIF_location").html('Visit Vendor in '+json.ven_det);
			$("#AIF_img").html('<a href="'+json.url+'" target="_blank"><img src="images/product/'+json.img+'" height="185" border="0"></a>');
			$("#AIF_desc").html(json.desc);
			
		
		}

	}

	});
	

}

// ================================ //
// ===== [ AUCTION DETAILS ] ====== //
// ================================ //


// ============================== //
// ===== [ AUCTION TIMER ] ====== //
// ============================== //

AuctionTimer.prototype.tick = function()
{
	$('#AIF_timer').countdown({
        until: this.getAuctionTime(),
		format: 'HMS',
		serverSync: this.getServerTime,
		onTick: this.finalCount,
		alwaysExpire: true,
		onExpiry: this.endAuction,
        compact: true
    });		//		alwaysExpire: true,
	
}

// ============================== //
// ===== [ AUCTION TIMER ] ====== //
// ============================== //

// ============================== //
// ==== [ GET AUCTION TIME ] ==== //
// ============================== //
AuctionTimer.prototype.getAuctionTime = function()
{
    
	var result = null;

    $.ajax({url: 'inc/inc.auction.php',
		cache: false,
		type: 'GET',
		data: {'action' : 'getEndTime', 'auctionID':this.auctionID},   
        async: false, 
		dataType: 'text', 
        success: function(text) { 
		
		var json = $.parseJSON(text);

			time=json.time;
			date=json.date;

        }
		});	


	newTime = time.split(":");
	var h = parseInt(newTime[0],10);
	var m = parseInt(newTime[1],10);
	var s = parseInt(newTime[2],10);
	
	newDate = date.split("-");
	var yr = parseInt(newDate[0],10);
	var mo = parseInt(newDate[1],10);
	var da = parseInt(newDate[2],10);	
	
	var date = new Date(yr, mo, da, h, m, s, 0);
	return date;
	
}
// ============================== //
// ==== [ GET AUCTION TIME ] ==== //
// ============================== //


// ============================= //
// ==== [ GET SERVER TIME ] ==== //
// ============================= //

AuctionTimer.prototype.getServerTime = function()
{

    var time = null; 
    $.ajax({url: 'inc/inc.auction.php',
		type: 'GET',
		data: {'action' : 'getTime'},   
        cache: false,
		async: false, 
		dataType: 'text', 
        success: function(text) { 
            time = new Date(text); 
			
        }, error: function(http, message, exc) { 
            time = new Date(); 
    }}); 
	
    return time; 
	
}

// ============================= //
// ==== [ GET SERVER TIME ] ==== //
// ============================= //


// ======================+======= //
// ==== [ COUNT DOWN TIMER ] ==== //
// =======================+====== //

AuctionTimer.prototype.finalCount = function(periods)
{

	if(periods[5] == 0 && periods[4] == 0)
	{
	
		
		if(periods[6] == 20)
		{
		  timer.extendTimer('syncTime','0');
		}
		
		if(periods[6] == 15)
		{
		  timer.extendTimer('syncTime','0');
		}		

		if(periods[6] == 11)
		{
		  timer.extendTimer('syncPrice','3');
		}	
		
		if(periods[6] == 10)
		{
		  timer.extendTimer('syncTime','1');
		}
		
		if(periods[6] == 3)
		{
		  timer.extendTimer('syncTime','1');
		}			
		
		if(periods[6] == 2)
		{
		  $('#AIF_timer').text('going..');
		  timer.extendTimer('syncTime','1');
		} 
		
		if(periods[6] == 1)
		{
		  $('#AIF_timer').text('..going');
		} 
		
		if(periods[6] == 0)
		{
		  $('#AIF_timer').text('GONE');
		  $('#AIF_button_wrap').html('<input type="button" class="button" value="BID" />');

		  
		} 		
	
	}
	
}

// ============================== //
// ==== [ COUNT DOWN TIMER ] ==== //
// ============================== //


// ============================== //
// ====== [ END AUCTION ] ======= //
// ============================== //

AuctionTimer.prototype.endAuction = function()
{

 timer.nextAuction();
	
}

// ============================== //
// ====== [ END AUCTION ] ======= //
// ============================== //


// =============================== //
// ====== [ NEXT AUCTION ] ======= //
// =============================== //

AuctionTimer.prototype.nextAuction = function()
{
  	var v_id = $("#AIF_AUCTION").data("aifId");
	var cust = $("#AIF_user").data("userId");
	
	$.ajax({
	type: 'GET',
	cache: false,
	url: 'inc/inc.auction.php',
	data: {'action' : 'endAuction', 'auctionID':this.auctionID, 'aifID':v_id, 'customerID':cust},
	success: function(auction_data)
	{
	   var json = $.parseJSON(auction_data);
	   
	   
		if(json.end == '1' && json.win == '1')
		{
			
		  $('#AIF_timer').html('<span style="color:red; font-size:0.8em">..processing</span>');
		  $('#AIF_close').click(function() { $("#AIF_cp").html(''); });
		  
		  setTimeout(function(){
			
			clearInterval(bid);
			$('#AIF_timer').html('<span style="color:red; font-size:0.8em">YOU WON</span>');
			$('#AIF_price').html('$' + json.final_price);
			$("#AIF_price").animate({ backgroundColor: "pink" }, 100).animate( { backgroundColor: '#fff' }, 300);
			
		   }, 2000);

			
		  setTimeout(function(){

			$('#AIF_timer').html('<span style="color:red; font-size:0.8em">'+json.username+'</span>');
			
		   }, 4000);			
		  
		  setTimeout(function(){

			  
              $('#AIF_cp').html('<div id="AIF_login" style="margin-left:0px;font-size:1.4em"><div>Congratulations!!!</div><br><div>You Won</div><br><div><input id="AIF_buy" type="submit" value="buy now"><input id="AIF_close" type="submit" value="buy later"></div></div></div>');
		
		      $('#AIF_login').show(600);
			  
			  if(json.auctionID == '1111') //Auction Queue
			  { 
				$("#AIF_title").html('Coming Soon!');
				$("#AIF_sub_title").html('Next auction will start soon.');
				$("#AIF_retail").html('Retails for: $0.00');
				$("#AIF_retailer").html('Featured Retailer - coming soon');
				$("#AIF_location").html('Visit Vendor at the AIF booth');
				$("#AIF_img").html('<img src="images/cs_logo.png" border="0">');
				$("#AIF_timer").html('00:00:00');
				$("#AIF_price").html('$0.01');
				$("#AIF_user").html('');
				$("#AIF_desc").html('The next auction will start soon. Take a look at the schedule listed below for details.');
			  
			  } else
			  {
				timer = new AuctionTimer(json.auctionID);
				timer.initTime();
	  			
				timer.resetTimer(json.auctionID);			
			  }
			
		   }, 8000);

			
		}	   
	   
		
		if(json.end == '1' && json.win == '0')
		{
			
		  $('#AIF_timer').html('<span style="color:red; font-size:0.8em">..processing</span>');
		  $('#AIF_close').click(function() { $("#AIF_cp").html(''); });
		  
		  setTimeout(function(){
			
			clearInterval(bid);
			$('#AIF_timer').html('<span style="color:red; font-size:0.8em">WINNER</span>');
			$('#AIF_price').html('$' + json.final_price);
			$("#AIF_price").animate({ backgroundColor: "pink" }, 100).animate( { backgroundColor: '#fff' }, 300);
			
		   }, 2000);

			
		  setTimeout(function(){

			$('#AIF_timer').html('<span style="color:red; font-size:0.8em">'+json.username+'</span>');
			
		   }, 4000);			
		  
		  setTimeout(function(){

			  if(json.auctionID == '1111')
			  { 
				$("#AIF_title").html('Coming Soon!');
				$("#AIF_sub_title").html('Next auction will start soon.');
				$("#AIF_retail").html('Retails for: $0.00');
				$("#AIF_retailer").html('Featured Retailer - coming soon');
				$("#AIF_location").html('Visit Vendor at the AIF booth');
				$("#AIF_img").html('<img src="images/cs_logo.png" border="0">');
				$("#AIF_timer").html('00:00:00');
				$("#AIF_price").html('$0.01');
				$("#AIF_user").html('');
				$("#AIF_desc").html('The next auction will start soon. Take a look at the schedule listed below for details.');
			  
			  } else
			  {
				timer = new AuctionTimer(json.auctionID);
				timer.initTime();
	  			
				timer.resetTimer(json.auctionID);			
			  }
			
		   }, 8000);

			
		}

		if(json.end == '2')
		{

		  $('#AIF_timer').html('<span style="color:red; font-size:0.8em">..processing</span>');
		  $('#AIF_close').click(function() { $("#AIF_cp").html(''); });
		  
		  setTimeout(function(){	
			
			clearInterval(bid);
			$('#AIF_timer').html('<span style="color:red; font-size:0.8em">NO WINNER</span>');
			$('#AIF_price').html('$' + json.final_price);
			$("#AIF_price").animate({ backgroundColor: "pink" }, 100).animate( { backgroundColor: '#fff' }, 300);
		  }, 2000);
		  
		  setTimeout(function(){

			  if(json.auctionID == '1111')
			  { 
				$("#AIF_title").html('Coming Soon!');
				$("#AIF_sub_title").html('Next auction will start soon.');
				$("#AIF_retail").html('Retails for: $0.00');
				$("#AIF_retailer").html('Featured Retailer - coming soon');
				$("#AIF_location").html('Visit Vendor at the AIF booth');
				$("#AIF_img").html('<img src="images/cs_logo.png" border="0">');
				$("#AIF_timer").html('00:00:00');
				$("#AIF_price").html('$0.01');
				$("#AIF_user").html('');
				$("#AIF_desc").html('The next auction will start soon. Take a look at the schedule listed below for details.');
			  
			  } else
			  {
				timer = new AuctionTimer(json.auctionID);
				timer.initTime();

				timer.resetTimer(json.auctionID);			
			  }
			
		   }, 6000);
			
			
		}			
		return false;
	}
	});	

}

// =============================== //
// ====== [ NEXT AUCTION ] ======= //
// =============================== //


// ============================== //
// ====== [ RESET TIMER ] ======= //
// ============================== //

AuctionTimer.prototype.resetTimer = function(auctionID)
{

	$('#AIF_button').show();
	var result = null;

    $.ajax({url: 'inc/inc.auction.php',
		cache: false,
		async: false,
		type: 'GET',
		data: {'action' : 'getEndTime', 'auctionID':auctionID},   
		dataType: 'text', 
        success: function(text) { 
            
		 var json = $.parseJSON(text);			
			
			time=json.time;
			date=json.date;

        }
		});	
	
	newTime = time.split(":");
	var h = parseInt(newTime[0],10);
	var m = parseInt(newTime[1],10);
	var s = parseInt(newTime[2],10);
	
	newDate = date.split("-");
	var yr = parseInt(newDate[0],10);
	var mo = parseInt(newDate[1],10);
	var da = parseInt(newDate[2],10);
	
	var date = new Date(yr, mo, da, h, m, s, 0);

    $('#AIF_timer').countdown('change', {until:date});	


}
// ============================== //
// ====== [ RESET TIMER ] ======= //
// ============================== //


// =============================== //
// ====== [ EXTEND TIMER ] ======= //
// =============================== //

AuctionTimer.prototype.extendTimer = function(action,xtnd)
{

	var result = null;

    $.ajax({url: 'inc/inc.auction.php',
		type: 'GET',
		cache: false,
		async: true,
		data: {'action' : action, 'auctionID':this.auctionID, 'xtnd':xtnd},   
		dataType: 'text', 
        success: function(text) { 
		
		var json = $.parseJSON(text);		
		  
		  if(json.sync == 'dateTime')
		  {

			time=json.time;
			date=json.date;
			
			newTime = time.split(":");
			var h = parseInt(newTime[0],10);
			var m = parseInt(newTime[1],10);
			var s = parseInt(newTime[2],10);
			
			newDate = date.split("-");
			var yr = parseInt(newDate[0],10);
			var mo = parseInt(newDate[1],10);
			var da = parseInt(newDate[2],10);
			  
			var date = new Date(yr, mo, da, h, m, s, 0);
		  
			  $('#AIF_timer').countdown('change', {until:date});	
		  } 
			
		return false;
        }
		});	
	

	
}

// =============================== //
// ====== [ EXTEND TIMER ] ======= //
// =============================== //


// =============================== //
// === [ CHECK CURRENT PRICE ] === //
// =============================== //

AuctionTimer.prototype.update_price = function()
{
	var p = $("#AIF_price").data("lastValue");
	$.ajax({
	type: 'GET',
	cache: false,
	url: 'inc/inc.auction.php',
	data: {'action' : 'bidPrice', 'auctionID':this.auctionID},
	success: function(auction_data)
	{
		var json = $.parseJSON(auction_data);
	
		$('#AIF_price').html('$' + json.price); // update price in page
		$('#AIF_price').data('lastValue', json.price); // update tag
		if(json.username == null)
	    {
			$("#AIF_user").html('no bidder'); // update tag
		  
		} else 
		{
			$('#AIF_user').data('highBidder', json.username); // update tag
			$('#AIF_user').html(json.username); // update tag
		}
		
	   if(json.token == '0')
	   {
		  $('#AIF_user').data('userId', '0');
		  //$('#AIF_button').removeClass("AIF_button2").addClass("AIF_button1");
		  //$('#AIF_button').val('LOGIN');
		  $('#AIF_button_wrap').html('<input type="button" class="button" id="AIF_button" value="LOGIN" onclick="location.href=\'https://aifbid.com/pages/?page=login\'"  />');

		  
		  
	   } else
		 {
			//$('#AIF_button').removeClass("AIF_button1").addClass("AIF_button2");
			//$('#AIF_button').val('BID');
			$('#AIF_button_wrap').html('<input type="button" class="button" id="AIF_button" value="BID" "  />');
		 }		
		
		
		if(json.price > p)
		{
		  $("#AIF_price").animate({ backgroundColor: "pink" }, 100).animate( { backgroundColor: '#fff' }, 300);
		}
		
		return false;
	
	}
	
	});	
	
}

// =============================== //
// === [ CHECK CURRENT PRICE ] === //
// =============================== //


// ============================ //
// === [ UPDATE BID PRICE ] === //
// ============================ //

AuctionTimer.prototype.update_bid_price = function()
{
	var p = $("#AIF_price").data("lastValue");
	
	$.ajax({
	type: 'GET',
	cache: false,
	async: false,
	url: 'inc/inc.auction.php',
	data: {'action' : 'updatePrice', 'auctionID':this.auctionID},
	success: function(auction_data)
	{
		var json = $.parseJSON(auction_data);
			
			$('#AIF_price').html('$' + json.price); // update price in page
			$('#AIF_price').data('lastValue', json.price); // update tag

			 if(json.token == '0')
			 {
				$('#AIF_user').data('userId', '0');
				//$('#AIF_button').removeClass("AIF_button2").addClass("AIF_button1");
				$('#AIF_button_wrap').html('<input type="button" class="button" id="AIF_button" value="LOGIN" onclick="location.href=\'https://aifbid.com/pages/?page=login\'"  />');
				
			 } else
			   {
				  //$('#AIF_button').removeClass("AIF_button1").addClass("AIF_button2");
				  $('#AIF_button_wrap').html('<input type="button" class="button" id="AIF_button" value="BID" />');
			   }
	
	
		if(json.price != undefined)
		{
			$("#AIF_price").animate({ backgroundColor: "pink" }, 80).animate( { backgroundColor: '#fff' }, 80);
	
		}
		
		return false;
	
	}
	
	});	
	
}

// ============================ //
// === [ UPDATE BID PRICE ] === //
// ============================ //


// ============================ //
// === [ UPDATE USER INFO ] === //
// ============================ //

AuctionTimer.prototype.update_user = function(action)
{

	$.ajax({
	type: 'GET',
	cache: false,
	url: 'inc/inc.auction.php',
	data: {'action' : action},
	success: function(auction_data)
	{
		var json = $.parseJSON(auction_data);
		
		if(json.error == '0')
		{
		  
		  $("#AIF_user").data("userId", json.customerID); // update tag
		  $("#AIF_user").data("userName", json.username); // update tag
		  $("#AIF_user").html(json.username); // update tag
		  
		}
		
		if(json.error == '1')
		{
		  
		  $("#AIF_user").data("userId", "0");
		  
		}		

		if(json.account == '1')
		{
					
		  $('#AIF_cp').html('<div id="AIF_login"><div style="text-align:left; padding-bottom:4px;">Welcome back '+json.username+'</div><div style="text-align:left; padding-bottom:2px;">Auctions Won: <span style="color:red;">'+json.wins+'</span></div><div style="text-align:left; padding-bottom:2px;">Bid Tokens: <span style="color:red;">'+json.tokens+'</span></div><div style="text-align:left; padding-bottom:2px;"><a href="../customer/">Pending Payment: <span style="color:red;">'+json.payup+'</span></a></div><div style="text-align:left;"></div><div id="AIF_close">close</div></div>');	
		  
		  $('#AIF_login').show(600);
					
		  $("#AIF_user").data("userName", json.username); // update tag
		  
		}		  
		  
		return false;
		
	}
	
	});	
	
}

// ============================ //
// === [ UPDATE USER INFO ] === //
// ============================ //

// ============================ //
// ====== [ LOGIN INFO ] ====== //
// ============================ //
AuctionTimer.prototype.login = function(action)
{

	var pwEncrypt;
	var username = $('#AIF_user_name').val();
	if( $('#AIF_password').val() != '' ) {
		pwEncrypt = $().crypt( {
			method: 'md5',
			source: $('#AIF_password').val()
		});
	
		$.ajax({
		type: 'GET',
		cache: false,
		url: 'inc/inc.auction.php',
		data: {'action' : action, 'username':username, 'password':pwEncrypt},
		success: function(auction_data)
		{
			var json = $.parseJSON(auction_data);
			
			if(json.error != 1)
			{
			  $("#AIF_user").data("userId", json.customerID); // update tag
			  $("#AIF_user").data("userName", json.username); // update tag
			  //$('#AIF_button').removeClass("AIF_button1").addClass("AIF_button2");
			  $('#AIF_button_wrap').html('<input type="button" class="button" id="AIF_button" value="BID" />');
			  $('#AIF_login').hide(600);
			  
			} else
			  {
				  $("#AIF_user").data("userId", "0");
				  alert('Login information incorrect. Please check username and password.');
			  }
			
		}
	  
	   });
	
		return;
		
	} else {
		
		alert('You must enter a password!');
		return false;
		
	}		

}

// ============================ //
// ====== [ LOGIN INFO ] ====== //
// ============================ //


// ============================ //
// === [ HIGH BIDDER INFO ] === //
// ============================ //

AuctionTimer.prototype.bidder_profile = function()
{
	var hbr = $('#AIF_user').data('highBidder');
	
	$.ajax({
	type: 'GET',
	cache: false,
	url: 'inc/inc.auction.php',
	data: {'action' : 'bidderProfile', 'bidder':hbr},
	success: function(auction_data)
	{
		var json = $.parseJSON(auction_data);

		
		if(json.cid != null)
		{
		    $('#AIF_login').html('<div id="AIF_stats"><div id="">auctions bid in: <span>'+json.ta+'</span></div><div id="">auctions won: <span>'+json.tw+'</span></div><div id="">winning percentage: <span>'+json.aw+'%</span></div><div id="">average win price: <span>$'+json.awp+'</span></div><div id="">average # bids: <span>'+json.ab+'</span></div><div id="">average bid time: <span>'+json.abt+'</span></div><div id="AIF_close">close</div></div>');
			
		}else
		{
			$('#AIF_login').html('<div id="AIF_login_field">No Stats</div><br><br><br><div id="AIF_close">close</div>');
		}
		
		  //return false;
		
	}
	
	});	
	
}

// ============================ //
// === [ HIGH BIDDER INFO ] === //
// ============================ //


// ============================== //
// === [ INITIALIZE AUCTION ] === //
// ============================== //
function initAIF_V1(aifID)
{
	
// ==== [VERIFY INSTALL, CHECK FOR EMPTY QUEUE AND PROVIDE STARTING AUCTION ID] ==== //	
	
  $.ajax({url: 'inc/inc.auction.php',
	  type: 'GET',
	  cache: false,
	  data: {'action' : 'getAuction', 'aifID': aifID},   
	  success: function(auction_data) 
	  { 
		var json = $.parseJSON(auction_data);
		
		if(json.auctionID == '0000' || json.auctionID == '1111')
		{
			if(json.auctionID == '0000')
			{
				$("#AIF_timer").html("ERROR");
				//$('#AIF_button').removeClass();
			}
			
			if(json.auctionID == '1111')
			{
				//$('#AIF_button').removeClass();
				$("#AIF_title").html('Coming Soon!');
				$("#AIF_sub_title").html('Next auction will start soon.');
				$("#AIF_retail").html('Retails for: $0.00');
				$("#AIF_retailer").html('Featured Retailer - coming soon');
				$("#AIF_location").html('Visit Vendor at the AIF booth');
				$("#AIF_img").html('<img src="images/cs_logo.png" border="0">');
				$("#AIF_timer").html('00:00:00');
				$("#AIF_price").html('$0.01');
				$("#AIF_user").html('');
				$("#AIF_desc").html('The next auction will start soon. Take a look at the schedule listed below for details.');
				
			}				
			
			
		} else
		  {

			timer = new AuctionTimer(json.auctionID);
        	timer.initTime();			  
		  
		  }
		return false;
	  }
	}); 
  
  $("#AIF_AUCTION").data("aifId", aifID);

}
// ============================== //
// === [ INITIALIZE AUCTION ] === //
// ============================== //


// ============================== //
// ======= [ BID BUTTON ] ======= //
// ============================== //

$("#AIF_AUCTION").bind("click", function(event) {

	if(event.target.id == 'AIF_button')
	{

		if($("#AIF_user").data("userId") == "0")
		{
			
			window.location.href = "https://aifbid.com/pages/?page=login";


		} else 
		  {

			  timer.update_bid_price();
				 
	  }
		  
	}		

	if(event.target.id == 'AIF_user')
	{
	
		$('#AIF_cp').html('<div id="AIF_login"></div>');
		
		timer.bidder_profile();
		
		$('#AIF_login').show(600);
	
	}

	if(event.target.id == 'AIF_title')
	{			
		var un = $("#AIF_user").data("userName");
		if(un!='0')
		{
			timer.update_user('myAccount');
			
		}else
		{
			$('#AIF_login_submit').click(function() {timer.login('AIFlogin'); });
		}

	}
	
	
	if(event.target.id == 'AIF_buy')
	{
		window.location = '../customer/';
	}
	
	
	if(event.target.id == 'AIF_register')
	{
		window.location = 'https://aifbid.com/pages/?page=login';
	}		
	
	
	if(event.target.id == 'AIF_close')
	{
		$("#AIF_cp").html('');
	}	


});

// ============================== //
// ======= [ BID BUTTON ] ======= //
// ============================== //