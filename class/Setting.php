<?php

namespace AppSync;

/**
 * Object class for the Setting objects.
 *
 * @author Chris Detsch
 * @package appsync
 *
 */

class Setting {
    protected $setting;
    protected $value;

    public function __construct($setting, $value)
    {
        $this->setting = $setting;
        $this->value = $value;
    }

    public function getSetting()
    {
        return $this->setting;
    }

    public function setSetting($setting)
    {
        $this->setting = $setting;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function setValue($value)
    {
        $this->value = $value;
    }

}
