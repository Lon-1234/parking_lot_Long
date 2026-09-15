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
 * 停车位表
 * </p>
 *
 * @author Long
 * @since 2026-09-13
 */
@Getter
@Setter
@TableName("parking_space")
public class ParkingSpace implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 车位主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 停车场ID，逻辑关联parking_lot.id
     */
    private Long parkingLotId;

    /**
     * 场内车位编号
     */
    private String spaceCode;

    /**
     * 类型：NORMAL/NEW_ENERGY/DISABLED
     */
    private String spaceType;

    /**
     * 状态：0停用，1空闲，2已占用，3维护中
     */
    private Byte status;

    /**
     * 当前占用车牌，空闲时为null
     */
    private String currentPlateNumber;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
