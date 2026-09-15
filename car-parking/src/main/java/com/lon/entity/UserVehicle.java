package com.lon.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 用户车辆表
 * </p>
 *
 * @author Long
 * @since 2026-09-13
 */
@Getter
@Setter
@TableName("user_vehicle")
public class UserVehicle implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 车辆主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 所属用户ID，逻辑关联sys_user.id
     */
    private Long userId;

    /**
     * 车牌号码
     */
    private String plateNumber;

    /**
     * 品牌
     */
    private String brand;

    /**
     * 型号
     */
    private String model;

    /**
     * 颜色
     */
    private String color;

    /**
     * 车辆类型：SMALL/NEW_ENERGY
     */
    private String vehicleType;

    /**
     * 是否默认：0否，1是
     */
    private Byte isDefault;

    /**
     * 状态：0停用，1正常
     */
    private Byte status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
