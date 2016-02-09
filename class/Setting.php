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

    /**
     * Returns the setting field
     * @return setting
     */
    public function getSetting()
    {
        return $this->setting;
    }

    /**
     * Sets the setting field for this class.
     */
    public function setSetting($setting)
    {
        $this->setting = $setting;
    }

    /**
     * Returns the value field
     * @return value
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Sets the value field for this class.
     */
    public function setValue($value)
    {
        $this->value = $value;
    }

}
