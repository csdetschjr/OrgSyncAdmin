<?php

namespace AppSync\Command;

/**
 * Controller class for handling a request to retrieve the settings in the database.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class AjaxGetSettings extends \AppSync\Command {

      public function getRequestVars(){
          return array('action'=>'AjaxGetUmbrellaList');
      }

      public function execute()
      {
          if(!(\Current_User::isDeity()))
          {
              echo json_encode('user does not have permission to retrieve live state');
              exit;
          }
          $liveUrl   = '';
          $testUrl   = '';
          $key       = '';
          $bannerUrl = '';

          $liveUrlSetting   = \AppSync\SettingFactory::getSetting('orgsync_live_url');
          $testUrlSetting   = \AppSync\SettingFactory::getSetting('orgsync_test_url');
          $keySetting       = \AppSync\SettingFactory::getSetting('orgsync_key');
          $bannerUrlSetting = \AppSync\SettingFactory::getSetting('banner_url');


          if($liveUrlSetting)
          {
              $liveUrl = $liveUrlSetting->getValue();
          }
          if($testUrlSetting)
          {
              $testUrl = $testUrlSetting->getValue();
          }
          if($keySetting)
          {
              $key = $keySetting->getValue();
          }
          if($bannerUrlSetting)
          {
              $bannerUrl = $bannerUrlSetting->getValue();
          }

          if($_SESSION['state'] != null)
          {
              $state = $_SESSION['state'];
          }
          else
          {
              $state             = 'LIVE';
              $_SESSION['state'] = 'LIVE';
          }

          echo json_encode(array('state' => $state, 'liveUrl' => $liveUrl, 'testUrl' => $testUrl,
                                    'key' => $key, 'bannerUrl' => $bannerUrl));
          exit;
      }
}
