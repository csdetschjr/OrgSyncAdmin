<?php

namespace AppSync\Command;

/**
 * Controller class for handling a request to update the Settings.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class AjaxSetSettings extends \AppSync\Command {

      public function getRequestVars(){
          return array('action'=>'AjaxGetUmbrellaList');
      }

      public function execute()
      {
          if(!(\Current_User::isDeity()))
          {
              echo json_encode('user does not have permission to set live state');
              exit;
          }
          $newState = $_REQUEST['state'];
          $newLiveUrl = $_REQUEST['liveUrl'];
          $newTestUrl = $_REQUEST['testUrl'];
          $newKey = $_REQUEST['key'];
          $newBannerUrl = $_REQUEST['bannerUrl'];

          if($newLiveUrl != '')
          {
              $liveUrlSetting = \AppSync\SettingFactory::getSetting("orgsync_live_url");
              if(!$liveUrlSetting)
              {
                  $liveUrlSetting = new \AppSync\Setting(NULL, 'orgsync_live_url', $newLiveUrl);
              }
              else
              {
                  $liveUrlSetting->setValue($newLiveUrl);
              }
              \AppSync\SettingFactory::save($liveUrlSetting);
          }

          if($newTestUrl != '')
          {
              $testUrlSetting = \AppSync\SettingFactory::getSetting("orgsync_test_url");
              if(!$testUrlSetting)
              {
                  $testUrlSetting = new \AppSync\Setting(NULL, 'orgsync_test_url', $newTestUrl);
              }
              else
              {
                  $testUrlSetting->setValue($newTestUrl);
              }
              \AppSync\SettingFactory::save($testUrlSetting);
          }

          if($newKey != '')
          {
              $keySetting = \AppSync\SettingFactory::getSetting("orgsync_key");
              if(!$keySetting)
              {
                  $keySetting = new \AppSync\Setting(NULL, 'orgsync_key', $newKey);
              }
              else
              {
                  $keySetting->setValue($newKey);
              }
              \AppSync\SettingFactory::save($keySetting);
          }

          if($newBannerUrl != '')
          {
              $bannerUrlSetting = \AppSync\SettingFactory::getSetting("banner_url");
              if(!$bannerUrlSetting)
              {
                  $bannerUrlSetting = new \AppSync\Setting(NULL, 'banner_url', $newBannerUrl);
              }
              else
              {
                  $bannerUrlSetting->setValue($newBannerUrl);
              }
              \AppSync\SettingFactory::save($bannerUrlSetting);
          }

          if($newState == 'LIVE')
          {
              $_SESSION['state'] = 'LIVE';
          }
          else if($newState == 'TEST')
          {
              $_SESSION['state'] = 'TEST';
          }
          else
          {
              echo json_encode(array('type' => 'success', 'message' => 'input does not match a valid server type: '.$newState));
              exit;
          }

          echo json_encode(array('type' => 'success', 'message' => "Changes saved successfully."));
          exit;
      }
}
